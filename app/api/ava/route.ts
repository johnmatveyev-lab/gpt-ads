import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import OpenAI from "openai";
import { trackServerEvent } from "@/lib/analytics";
import { saveLocalAgentSession, saveLocalLead } from "@/lib/local-store";
import { notifyLead } from "@/lib/notifications";
import { scoreLead } from "@/lib/scoring";
import { isSupabaseConfigured, saveSupabaseAgentSession, saveSupabaseLead } from "@/lib/supabase";
import type { AgentSessionRecord, LeadInput, LeadRecord } from "@/lib/types";
import { agentRequestSchema, leadInputSchema } from "@/lib/validation";

const systemPrompt = `You are Ava, the AI Growth Consultant for GPT Ads Launch.

Mission:
- Help local businesses understand whether ChatGPT Ads are worth exploring.
- Explain ChatGPT Ads in practical language.
- Ask for business type, location, offer, target customers, current channels, budget, website, urgency, and consent before follow-up.
- Recommend a readiness audit or human launch-readiness call when useful.

Guardrails:
- Do not claim we are an official OpenAI partner unless the user supplies verified proof in the current conversation.
- Do not claim direct OpenAI Ads access.
- Do not guarantee leads, sales, ROAS, CPC, CPM, delivery, placement, or approval.
- Do not say ads cause ChatGPT organic answers to recommend the advertiser.
- Say that ads are paid, labeled placements and OpenAI controls review, pricing, availability, delivery, and reporting.
- Flag sensitive or regulated categories for human review.
- Keep answers concise and useful.`;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = agentRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Ava request." }, { status: 400 });
  }

  const { messages, leadContext, captureLead = false, sessionId = randomUUID() } = parsed.data;
  const message = process.env.OPENAI_API_KEY
    ? await getOpenAIResponse(messages)
    : getFallbackResponse(messages[messages.length - 1]?.content || "");

  const fullLeadContext = leadInputSchema.safeParse(leadContext);
  const readinessResult = scoreLead(fullLeadContext.success ? fullLeadContext.data : toScorableLead(leadContext));
  let capturedLead: LeadRecord | null = null;

  if (captureLead && fullLeadContext.success) {
    const now = new Date().toISOString();
    capturedLead = {
      ...fullLeadContext.data,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      ...readinessResult,
      status:
        readinessResult.fitLevel === "needs_human_review" || readinessResult.bookingRecommended ? "audit_ready" : "new",
      bookingStatus: "not_started",
      agentSummary: summarizeMessages(messages),
    };

    if (isSupabaseConfigured()) {
      await saveSupabaseLead(capturedLead);
    } else {
      await saveLocalLead(capturedLead);
    }
    await notifyLead(capturedLead);
  }

  const session: AgentSessionRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    leadId: capturedLead?.id,
    sessionId,
    summary: summarizeMessages(messages),
    readinessResult,
    handoffRecommended: readinessResult.bookingRecommended,
    policyReviewRequired: readinessResult.policyReviewRequired,
    source: "ava-chat",
  };

  try {
    await trackServerEvent({
      id: randomUUID(),
      event: "ava_started",
      createdAt: session.createdAt,
      payload: {
        sessionId,
        mode: process.env.OPENAI_API_KEY ? "openai" : "local-fallback",
      },
    });

    await saveSupabaseAgentSession(session);
  } catch {
    await saveLocalAgentSession(session);
  }

  return NextResponse.json({
    message,
    readinessResult,
    bookingRecommended: readinessResult.bookingRecommended,
    sessionId,
    capturedLead,
    mode: process.env.OPENAI_API_KEY ? "openai" : "local-fallback",
  });
}

async function getOpenAIResponse(messages: { role: "user" | "assistant"; content: string }[]) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: "gpt-5-mini",
    instructions: systemPrompt,
    input: messages.map((message) => ({
      role: message.role,
      content: [{ type: "input_text", text: message.content }],
    })),
  });

  return response.output_text;
}

function getFallbackResponse(input: string) {
  const lower = input.toLowerCase();

  if (lower.includes("official") || lower.includes("partner")) {
    return "I should be precise: this service is independent unless verified partnership proof is explicitly provided. We can help with readiness, tracking, landing pages, and launch planning, but we should not imply OpenAI endorsement.";
  }

  if (lower.includes("guarantee") || lower.includes("guaranteed")) {
    return "No honest service should guarantee leads, placement, CPC, CPM, or OpenAI approval. What we can do is improve readiness: offer clarity, landing-page quality, tracking, policy review, and campaign planning.";
  }

  if (/(health|medical|law|legal|finance|loan|gambling|alcohol|tobacco|dating|political|weapon|crypto)/i.test(lower)) {
    return "That category may need human policy review before campaign work. I can still collect your business details and route you to a launch-readiness call, but we should avoid making eligibility promises.";
  }

  return "Good starting point. To assess ChatGPT Ads readiness, I need your business type, location, main offer, target customer, current ad channels, monthly budget range, website URL, and how soon you want to launch. Then I can recommend whether to book a launch-readiness call.";
}

function toScorableLead(partial?: Partial<LeadInput>): LeadInput {
  return {
    name: partial?.name || "Ava visitor",
    email: partial?.email || "visitor@example.com",
    phone: partial?.phone,
    businessName: partial?.businessName || "Local business",
    businessType: partial?.businessType || "local service",
    location: partial?.location || "United States",
    websiteUrl: partial?.websiteUrl,
    primaryOffer: partial?.primaryOffer || "Local service offer",
    targetCustomers: partial?.targetCustomers || "Local customers comparing providers",
    currentChannels: partial?.currentChannels || [],
    monthlyAdBudgetRange: partial?.monthlyAdBudgetRange || "$1,000-$2,500/mo",
    urgency: partial?.urgency || "This month",
    consentToContact: partial?.consentToContact ?? true,
  };
}

function summarizeMessages(messages: { role: "user" | "assistant"; content: string }[]) {
  return messages
    .slice(-6)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n")
    .slice(0, 1800);
}
