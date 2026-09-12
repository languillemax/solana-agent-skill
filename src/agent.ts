import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import dotenv from "dotenv";
import { loadAgentSigner } from "./security/signer.js";

dotenv.config();

export class SolanaAgent {
  public readonly connection: Connection;
  private readonly signer: Keypair | null;

  constructor(rpcUrl?: string) {
    const url =
      rpcUrl ||
      process.env.SOLANA_RPC_URL ||
      "https://api.mainnet-beta.solana.com";

    this.connection = new Connection(url, "confirmed");
    this.signer = loadAgentSigner();
  }

  public isReadOnly(): boolean {
    return this.signer === null;
  }

  public getPublicKey(): PublicKey | null {
    return this.signer?.publicKey ?? null;
  }

  public requireSigner(): Keypair {
    if (!this.signer) {
      throw new Error(
        "READ_ONLY_MODE: AGENT_PRIVATE_KEY is required for transaction execution",
      );
    }

    return this.signer;
  }

  async getBalance(pubkey?: PublicKey): Promise<number> {
    const target = pubkey || this.signer?.publicKey;

    if (!target) {
      throw new Error("Aucune clé publique spécifiée.");
    }

    const balance = await this.connection.getBalance(target);
    return balance / LAMPORTS_PER_SOL;
  }
}
