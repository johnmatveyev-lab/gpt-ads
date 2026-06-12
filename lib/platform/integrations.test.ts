import { describe, expect, it } from "vitest";
import { integrationInputSchema } from "@/lib/validation";
import { fromIntegrationRow } from "@/lib/platform/leads";

describe("platform integrations", () => {
  it("validates all planned ad network credential inputs", () => {
    for (const networkName of ["google", "facebook", "tiktok", "openai"]) {
      const parsed = integrationInputSchema.safeParse({
        networkName,
        environment: "production",
        accountId: `${networkName}-account`,
        apiKey: `${networkName}-secret-token`,
        parameters: { managerAccountId: "1234567890" },
        isActive: true,
      });

      expect(parsed.success).toBe(true);
    }
  });

  it("serializes integration rows without encrypted or raw credentials", () => {
    const serialized = fromIntegrationRow({
      id: "integration-1",
      owner_profile_id: "owner-1",
      network_name: "google",
      environment: "production",
      account_id: "123-456-7890",
      encrypted_api_key: "encrypted-value",
      encrypted_access_token: "encrypted-token",
      parameters: { developerTokenConfigured: true },
      status: "configured",
      is_active: true,
      last_verified_at: "2026-06-12T12:00:00.000Z",
      updated_at: "2026-06-12T12:01:00.000Z",
    });

    expect(serialized).toMatchObject({
      id: "integration-1",
      ownerProfileId: "owner-1",
      networkName: "google",
      environment: "production",
      accountId: "123-456-7890",
      status: "configured",
      isActive: true,
      lastVerifiedAt: "2026-06-12T12:00:00.000Z",
    });
    expect(JSON.stringify(serialized)).not.toContain("encrypted-value");
    expect(JSON.stringify(serialized)).not.toContain("encrypted-token");
  });
});
