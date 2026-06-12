import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "@/lib/security/crypto";

describe("credential encryption", () => {
  const secret = "0123456789abcdef0123456789abcdef";

  it("encrypts secrets without storing plaintext and decrypts them with the same key", () => {
    const encrypted = encryptSecret("sk-openai-ads-test", secret);

    expect(encrypted).not.toContain("sk-openai-ads-test");
    expect(encrypted.split(":")).toHaveLength(3);
    expect(decryptSecret(encrypted, secret)).toBe("sk-openai-ads-test");
  });

  it("rejects invalid encryption keys", () => {
    expect(() => encryptSecret("value", "too-short")).toThrow("PLATFORM_ENCRYPTION_KEY");
  });
});
