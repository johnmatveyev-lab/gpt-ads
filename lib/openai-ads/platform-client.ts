import { decryptSecret } from "@/lib/security/crypto";

type OpenAiAdsIntegration = {
  encryptedApiKey: string;
  accountId: string;
  isActive: boolean;
};

export function createOpenAiAdsPlatformClient(integration: OpenAiAdsIntegration) {
  if (!integration.isActive) {
    throw new Error("OpenAI Ads integration is inactive.");
  }

  const apiKey = decryptSecret(integration.encryptedApiKey);
  if (!apiKey || !integration.accountId) {
    throw new Error("OpenAI Ads account ID and API key are required.");
  }

  return {
    accountId: integration.accountId,
    async assertReady() {
      return {
        ok: true,
        accountId: integration.accountId,
        message:
          "OpenAI Ads credentials are stored and ready for measurement/API calls once account access is active.",
      };
    },
  };
}
