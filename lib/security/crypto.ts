import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const algorithm = "aes-256-gcm";

export function encryptSecret(plaintext: string, key = process.env.PLATFORM_ENCRYPTION_KEY || "") {
  const keyBuffer = getKeyBuffer(key);
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, keyBuffer, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(":");
}

export function decryptSecret(encryptedValue: string, key = process.env.PLATFORM_ENCRYPTION_KEY || "") {
  const [ivValue, tagValue, ciphertextValue] = encryptedValue.split(":");
  if (!ivValue || !tagValue || !ciphertextValue) {
    throw new Error("Encrypted secret is malformed.");
  }

  const decipher = createDecipheriv(algorithm, getKeyBuffer(key), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function getKeyBuffer(key: string) {
  const keyBuffer = Buffer.from(key, "utf8");
  if (keyBuffer.length !== 32) {
    throw new Error("PLATFORM_ENCRYPTION_KEY must be exactly 32 UTF-8 bytes.");
  }

  return keyBuffer;
}
