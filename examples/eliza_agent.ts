import { solanaAgentPlugin } from "../src/eliza.js";
import { AgentRuntime } from "@elizaos/core";

/**
 * Exemple d'initialisation d'un Agent ElizaOS avec le Solana Agent Skill Toolkit
 */
async function main() {
  console.log("Démarrage de l'agent ElizaOS avec le plugin Solana Agent Skill...");

  const runtime = new AgentRuntime({
    token: process.env.OPENAI_API_KEY || "mock-token",
    modelProvider: "openai",
    plugins: [solanaAgentPlugin],
  });

  console.log("✔ Plugin Solana Agent Skill chargé dans ElizaOS !");
  console.log("Actions enregistrées :", solanaAgentPlugin.actions.map(a => a.name).join(", "));
}

main().catch(console.error);
