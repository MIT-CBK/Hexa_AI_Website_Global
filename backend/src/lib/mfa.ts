import { authenticator } from "otplib"
import QRCode from "qrcode"
import { randomBytes } from "node:crypto"
import { hashPassword, verifyPassword } from "./password.js"

const ISSUER = "Hexa AI"

// Allow ±1 time-step (30s) to tolerate clock drift on the authenticator app.
authenticator.options = { window: 1 }

export function generateTotpSecret(): string {
  return authenticator.generateSecret()
}

export function totpKeyUri(account: string, secret: string): string {
  return authenticator.keyuri(account, ISSUER, secret)
}

export function totpQrDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri)
}

export function verifyTotp(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token: token.replace(/\s/g, ""), secret })
  } catch {
    return false // fail securely
  }
}

/** Generate human-friendly one-time recovery codes (shown to the user once). */
export function generateRecoveryCodes(n = 10): string[] {
  return Array.from({ length: n }, () => {
    const hex = randomBytes(5).toString("hex") // 10 hex chars
    return `${hex.slice(0, 5)}-${hex.slice(5)}`
  })
}

export function hashRecoveryCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map((c) => hashPassword(c)))
}

/**
 * If `code` matches one of the stored hashes, return the remaining hashes
 * (the matched code is consumed). Returns null when no code matches.
 */
export async function consumeRecoveryCode(
  code: string,
  hashes: string[],
): Promise<string[] | null> {
  const clean = code.trim()
  for (let i = 0; i < hashes.length; i++) {
    if (await verifyPassword(hashes[i], clean)) {
      return hashes.filter((_, idx) => idx !== i)
    }
  }
  return null
}

export function parseHashes(raw: string): string[] {
  try {
    const v: unknown = JSON.parse(raw)
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []
  } catch {
    return []
  }
}
