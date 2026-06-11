import { z } from "zod";

export const leadInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  businessName: z.string().trim().min(2).max(160),
  businessType: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(160),
  websiteUrl: z.string().trim().url().max(300).optional().or(z.literal("")),
  primaryOffer: z.string().trim().min(4).max(600),
  targetCustomers: z.string().trim().min(4).max(600),
  currentChannels: z.array(z.string().trim().max(80)).default([]),
  monthlyAdBudgetRange: z.string().trim().min(1).max(80),
  urgency: z.string().trim().min(1).max(120),
  consentToContact: z.boolean().refine((value) => value, {
    message: "Consent is required before we can follow up.",
  }),
  source: z.string().trim().max(120).optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(160).optional(),
  utmContent: z.string().trim().max(160).optional(),
  utmTerm: z.string().trim().max(160).optional(),
});

export const agentRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(3000),
      }),
    )
    .min(1)
    .max(20),
  leadContext: leadInputSchema.partial().optional(),
  captureLead: z.boolean().optional(),
  sessionId: z.string().trim().max(120).optional(),
});
