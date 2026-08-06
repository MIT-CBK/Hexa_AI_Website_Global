import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"
import { env } from "../env.js"

/**
 * At-rest secret encryption (AES-256-GCM). The key is derived from JWT_SECRET,
 * so no extra secret is needed and rotating JWT_SECRET invalidates stored
 * secrets (which then simply need re-entering). Output = base64(iv|tag|cipher).
 */
const key = createHash("sha256").update(env.JWT_SECRET).digest() // 32 bytes

export function encryptSecret(plain: string): string {
  if (!plain) return ""
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, ct]).toString("base64")
}

export function decryptSecret(enc: string): string {
  if (!enc) return ""
  try {
    const buf = Buffer.from(enc, "base64")
    const iv = buf.subarray(0, 12)
    const tag = buf.subarray(12, 28)
    const ct = buf.subarray(28)
    const decipher = createDecipheriv("aes-256-gcm", key, iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8")
  } catch {
    return "" // tampered or key rotated → treat as no secret
  }
}
