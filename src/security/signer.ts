import { Keypair } from "@solana/web3.js";

export function loadAgentSigner(): Keypair | null {
  const raw = process.env.AGENT_PRIVATE_KEY;

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed) || parsed.length !== 64) {
      throw new Error("AGENT_PRIVATE_KEY must contain exactly 64 bytes");
    }

    const secretKey = Uint8Array.from(parsed);

    if (secretKey.length !== 64) {
      throw new Error("Invalid secret key length");
    }

    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    throw new Error(
      `Invalid AGENT_PRIVATE_KEY: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
