import { SolanaAgent } from './agent.js';

async function main() {
  console.log("🚀 Lancement du Solana Agent Skill...");
  const agent = new SolanaAgent();
  
  if (agent.keypair) {
    console.log(`🔑 Wallet actif : ${agent.keypair.publicKey.toBase58()}`);
    const balance = await agent.getBalance();
    console.log(`💰 Solde SOL : ${balance} SOL`);
  } else {
    console.log("ℹ️ Mode démo / lecture seule.");
  }
}

main().catch(console.error);
