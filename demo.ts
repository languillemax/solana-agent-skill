import { SOLANA_AGENT_TOOLS, solanaAgentPlugin } from "./src/index.js";

console.log("--- SOLANA AGENT SKILL DEMO ---\n");

console.log("1. Schemas Function Calling AI charges :");
console.dir(SOLANA_AGENT_TOOLS, { depth: null });

console.log("\n2. Plugin ElizaOS pret :");
console.log(`Nom: ${solanaAgentPlugin.name}`);
console.log(`Actions: ${solanaAgentPlugin.actions.map(a => a.name).join(", ")}`);

console.log("\nTout est operationnel.");
