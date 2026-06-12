import { beforeEach, describe, expect, it, vi } from "vitest";

type RepRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  mobile_number: string | null;
};

const mockState = vi.hoisted(() => ({
  insertedRows: [] as Record<string, unknown>[],
  insertError: null as { message: string } | null,
  reps: [] as RepRow[],
  profilesError: null as { message: string } | null,
  serviceEnabled: true,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServiceClient: () => {
    if (!mockState.serviceEnabled) return null;

    return {
      from(table: string) {
        if (table === "leads") {
          return {
            insert(row: Record<string, unknown>) {
              mockState.insertedRows.push(row);
              return {
                select() {
                  return {
                    async single() {
                      if (mockState.insertError) return { data: null, error: mockState.insertError };
                      return {
                        data: { ...row, id: row.id ?? "lead-123" },
                        error: null,
                      };
                    },
                  };
                },
              };
            },
          };
        }

        if (table === "profiles") {
          const query = {
            eq() {
              return query;
            },
            then(resolve: (value: unknown) => unknown, reject: (reason?: unknown) => unknown) {
              return Promise.resolve({ data: mockState.reps, error: mockState.profilesError }).then(resolve, reject);
            },
          };

          return {
            select() {
              return query;
            },
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    };
  },
}));

const validPayload = {
  businessName: "Atlas Roofing",
  websiteUrl: "https://atlas.example",
  contactName: "Dana Lee",
  contactEmail: "dana@atlas.example",
  contactPhone: "+15551234567",
  nicheIndustry: "Roofing",
  targetGeography: "Austin, TX",
};

describe("POST /api/leads/onboard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockState.insertedRows = [];
    mockState.insertError = null;
    mockState.reps = [
      {
        id: "rep-1",
        email: "rep@example.com",
        full_name: "Sales Rep",
        mobile_number: "+15557654321",
      },
    ];
    mockState.profilesError = null;
    mockState.serviceEnabled = true;
    process.env.TWILIO_ACCOUNT_SID = "AC123";
    process.env.TWILIO_AUTH_TOKEN = "twilio-token";
    process.env.TWILIO_FROM_NUMBER = "+15550000000";
    process.env.RESEND_API_KEY = "resend-key";
    process.env.EMAIL_FROM = "GPT Ads <ops@example.com>";
    process.env.NEXT_PUBLIC_APP_URL = "https://gpt-ads.example";
    process.env.VAPI_WEBHOOK_URL = "https://vapi.example/webhook";
    process.env.VAPI_WEBHOOK_TOKEN = "vapi-token";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })),
    );
  });

  it("inserts a new lead and triggers SMS, email, and VAPI for active sales reps", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("https://site.example/api/leads/onboard", {
        method: "POST",
        body: JSON.stringify(validPayload),
      }) as never,
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(mockState.insertedRows).toHaveLength(1);
    expect(mockState.insertedRows[0]).toMatchObject({
      business_name: "Atlas Roofing",
      status: "new",
      contact_name: "Dana Lee",
      contact_email: "dana@atlas.example",
      contact_phone: "+15551234567",
      niche_industry: "Roofing",
      target_geography: "Austin, TX",
    });
    expect(body.notifications.sms).toHaveLength(1);
    expect(body.notifications.email).toHaveLength(1);
    expect(body.voice.ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("returns validation issues for invalid payloads", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("https://site.example/api/leads/onboard", {
        method: "POST",
        body: JSON.stringify({ businessName: "A" }),
      }) as never,
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.issues.fieldErrors.websiteUrl).toBeDefined();
    expect(mockState.insertedRows).toHaveLength(0);
  });

  it("returns a saved lead with a warning when no active sales reps are available", async () => {
    mockState.reps = [];
    const { POST } = await import("./route");

    const response = await POST(
      new Request("https://site.example/api/leads/onboard", {
        method: "POST",
        body: JSON.stringify(validPayload),
      }) as never,
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.warnings).toContain("No active sales reps with SMS or email recipients were found.");
    expect(body.notifications.sms).toEqual([]);
    expect(body.notifications.email).toEqual([]);
    expect(body.voice.ok).toBe(true);
  });

  it("captures downstream failures without rolling back the saved lead", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL | Request) => {
        const value = String(url);
        if (value.includes("twilio")) return new Response("bad sms", { status: 500 });
        if (value.includes("resend")) return new Response("bad email", { status: 502 });
        return new Response("bad voice", { status: 503 });
      }),
    );
    const { POST } = await import("./route");

    const response = await POST(
      new Request("https://site.example/api/leads/onboard", {
        method: "POST",
        body: JSON.stringify(validPayload),
      }) as never,
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(mockState.insertedRows).toHaveLength(1);
    expect(body.notifications.sms[0]).toMatchObject({ ok: false, status: 500 });
    expect(body.notifications.email[0]).toMatchObject({ ok: false, status: 502 });
    expect(body.voice).toMatchObject({ ok: false, status: 503 });
  });

  it("skips VAPI for review-required categories", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("https://site.example/api/leads/onboard", {
        method: "POST",
        body: JSON.stringify({ ...validPayload, nicheIndustry: "Medical clinic" }),
      }) as never,
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.voice).toMatchObject({ ok: true, skipped: true });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
