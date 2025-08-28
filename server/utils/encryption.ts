import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "soulspeak_healing_encryption_key_32";

const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32));

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();


    return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    return simpleEncrypt(text);
  }
}

export function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(":");

    if (parts.length !== 3) {
      return simpleDecrypt(encryptedData);
    }

    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return simpleDecrypt(encryptedData);
  }
}

export function simpleEncrypt(text: string): string {
  return Buffer.from(text).toString("base64");
}

export function simpleDecrypt(encryptedText: string): string {
  try {
    return Buffer.from(encryptedText, "base64").toString("utf8");
  } catch (error) {
    console.error("Simple decryption error:", error);
    return encryptedText;
  }
}
