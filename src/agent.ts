import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

export class SolanaAgent {
  public connection: Connection;
  public keypair: Keypair | null = null;

  constructor(rpcUrl?: string) {
    const url = rpcUrl || process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(url, 'confirmed');

    if (process.env.AGENT_PRIVATE_KEY) {
      try {
        const secretKey = Uint8Array.from(JSON.parse(process.env.AGENT_PRIVATE_KEY));
        this.keypair = Keypair.fromSecretKey(secretKey);
      } catch (e) {
        console.warn("⚠️ AGENT_PRIVATE_KEY invalide ou absente. Mode lecture seule actif.");
      }
    }
  }

  async getBalance(pubkey?: PublicKey): Promise<number> {
    const target = pubkey || this.keypair?.publicKey;
    if (!target) throw new Error("Aucune clé publique spécifiée.");
    const balance = await this.connection.getBalance(target);
    return balance / LAMPORTS_PER_SOL;
  }
}
