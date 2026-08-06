import { hash, verify } from "@node-rs/argon2"

// Argon2id with sensible defaults (prebuilt binaries — no native build needed).
const OPTS = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, OPTS)
}

export async function verifyPassword(stored: string, plain: string): Promise<boolean> {
  try {
    return await verify(stored, plain, OPTS)
  } catch {
    // Fail securely: any verification error is treated as a non-match.
    return false
  }
}
