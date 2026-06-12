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

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional().or(z.literal("")),
});

export const leadPipelineUpdateSchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(["new", "contacted", "audit_ready", "closed_won", "closed_lost"]).optional(),
  ownerId: z.string().uuid().nullable().optional(),
  bookingStatus: z.enum(["not_started", "started", "booked"]).optional(),
  adminNotes: z.string().trim().max(3000).optional(),
  markContacted: z.boolean().optional(),
});

export const auditUpdateSchema = z.object({
  auditData: z
    .object({
      visibilityMetrics: z
        .object({
          impressions: z.coerce.number().int().nonnegative().optional(),
          clicks: z.coerce.number().int().nonnegative().optional(),
          spend: z.coerce.number().nonnegative().optional(),
          ctr: z.coerce.number().nonnegative().optional(),
          averageCpc: z.coerce.number().nonnegative().optional(),
          averageCpm: z.coerce.number().nonnegative().optional(),
          conversions: z.coerce.number().int().nonnegative().optional(),
        })
        .optional(),
      opportunities: z.array(z.string().trim().min(1).max(180)).max(12).optional(),
      risks: z.array(z.string().trim().min(1).max(180)).max(12).optional(),
      nextAction: z.string().trim().max(500).optional(),
    })
    .default({}),
});

export const integrationInputSchema = z.object({
  networkName: z.enum(["openai", "google", "facebook", "tiktok"]),
  environment: z.enum(["sandbox", "production"]).default("production"),
  accountId: z.string().trim().min(2).max(160),
  apiKey: z.string().trim().min(8).max(4000),
  accessToken: z.string().trim().min(8).max(4000).optional().or(z.literal("")),
  parameters: z.record(z.string(), z.unknown()).default({}),
  isActive: z.boolean().default(true),
});
