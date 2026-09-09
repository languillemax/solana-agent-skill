import { SOLANA_AGENT_TOOLS } from "./tools.js";

export const solanaAgentPlugin = {
  name: "solana-agent-skill",
  description: "Plugin d'exécution Solana pour ElizaOS (Jupiter v6 Swaps & Transferts)",
  actions: SOLANA_AGENT_TOOLS.map(tool => ({
    name: tool.name,
    description: tool.description,
    simulatedHandler: async () => {
      return { success: true, message: `Action ${tool.name} prête pour exécution.` };
    }
  }))
};
