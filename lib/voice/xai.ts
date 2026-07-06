const XAI_REALTIME_WS_URL = "wss://api.x.ai/v1/realtime";
const XAI_CLIENT_SECRETS_URL = "https://api.x.ai/v1/realtime/client_secrets";

export function isXaiVoiceConfigured() {
  return Boolean(process.env.XAI_API_KEY && process.env.XAI_VOICE_AGENT_ID);
}

export type XaiVoiceSession = {
  token: string;
  expiresAt?: number;
  wsUrl: string;
};

/**
 * Mints a short-lived xAI Realtime client secret server-side so the browser
 * never sees XAI_API_KEY. The client opens the WebSocket using this token
 * instead of the long-lived API key.
 */
export async function createXaiVoiceSession(): Promise<XaiVoiceSession> {
  const apiKey = process.env.XAI_API_KEY;
  const agentId = process.env.XAI_VOICE_AGENT_ID;
  if (!apiKey || !agentId) {
    throw new Error("XAI_API_KEY and XAI_VOICE_AGENT_ID are required for voice.");
  }

  const response = await fetch(XAI_CLIENT_SECRETS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expires_after: { seconds: 300 } }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`xAI ephemeral token request failed (${response.status}): ${detail.slice(0, 300)}`);
  }

  const data = await response.json();
  // xAI's Realtime API mirrors OpenAI's realtime client-secret shape; accept
  // either a flat `value` field or a nested `client_secret.value`.
  const token: string | undefined = data.value ?? data.client_secret?.value;
  const expiresAt: number | undefined = data.expires_at ?? data.client_secret?.expires_at;

  if (!token) {
    throw new Error("xAI ephemeral token response did not include a token value.");
  }

  return {
    token,
    expiresAt,
    wsUrl: `${XAI_REALTIME_WS_URL}?agent_id=${encodeURIComponent(agentId)}`,
  };
}
