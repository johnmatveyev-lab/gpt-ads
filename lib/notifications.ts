import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getRuntimeDataDir } from "@/lib/runtime-paths";
import type { LeadRecord } from "@/lib/types";

const dataDir = getRuntimeDataDir();
const notificationsPath = path.join(dataDir, "notifications.json");

type NotificationRecord = {
  createdAt: string;
  type: "internal" | "visitor";
  to: string;
  subject: string;
  status: "sent" | "recorded";
  leadId: string;
};

export async function notifyLead(lead: LeadRecord) {
  const records: NotificationRecord[] = [];
  const internalEmail = process.env.LEAD_NOTIFY_EMAIL;

  if (internalEmail) {
    records.push(
      await sendOrRecord({
        type: "internal",
        to: internalEmail,
        subject: `New ChatGPT Ads lead: ${lead.businessName}`,
        text: [
          `${lead.name} submitted a readiness audit for ${lead.businessName}.`,
          `Fit: ${lead.fitLevel}. Score: ${lead.readinessScore}/100.`,
          `Business type: ${lead.businessType}. Location: ${lead.location}.`,
          `Next step: ${lead.recommendedNextStep}`,
        ].join("\n"),
        leadId: lead.id,
      }),
    );
  }

  records.push(
    await sendOrRecord({
      type: "visitor",
      to: lead.email,
      subject: "Your ChatGPT Ads readiness audit",
      text: [
        `Hi ${lead.name},`,
        "",
        `Your readiness score is ${lead.readinessScore}/100 and your fit level is ${lead.fitLevel.replaceAll("_", " ")}.`,
        lead.recommendedNextStep,
        "",
        "This service is independent unless verified OpenAI partnership proof is explicitly stated.",
      ].join("\n"),
      leadId: lead.id,
    }),
  );

  return records;
}

async function sendOrRecord(input: {
  type: "internal" | "visitor";
  to: string;
  subject: string;
  text: string;
  leadId: string;
}): Promise<NotificationRecord> {
  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "GPT Ads Launch <onboarding@resend.dev>",
        to: input.to,
        subject: input.subject,
        text: input.text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend notification failed with ${response.status}.`);
    }

    return {
      createdAt: new Date().toISOString(),
      type: input.type,
      to: input.to,
      subject: input.subject,
      status: "sent",
      leadId: input.leadId,
    };
  }

  const record: NotificationRecord = {
    createdAt: new Date().toISOString(),
    type: input.type,
    to: input.to,
    subject: input.subject,
    status: "recorded",
    leadId: input.leadId,
  };
  await recordLocalNotification(record);
  return record;
}

async function recordLocalNotification(record: NotificationRecord) {
  let records: NotificationRecord[] = [];
  try {
    records = JSON.parse(await readFile(notificationsPath, "utf8")) as NotificationRecord[];
  } catch {
    records = [];
  }

  await mkdir(dataDir, { recursive: true });
  await writeFile(notificationsPath, `${JSON.stringify([record, ...records].slice(0, 500), null, 2)}\n`, "utf8");
}
