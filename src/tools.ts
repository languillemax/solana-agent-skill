export const SOLANA_AGENT_TOOLS = [
  {
    name: "solana_transfer_sol",
    description: "Transfère des SOL vers une adresse destinataire sur Solana.",
    parameters: {
      type: "object",
      properties: {
        to: { type: "string", description: "Adresse Solana publique du destinataire" },
        amountSol: { type: "number", description: "Montant en SOL à transférer" }
      },
      required: ["to", "amountSol"]
    }
  },
  {
    name: "solana_jupiter_swap",
    description: "Exécute un swap de tokens via Jupiter API v6 sur Solana.",
    parameters: {
      type: "object",
      properties: {
        inputMint: { type: "string", description: "Adresse Mint du token source (ex: So11111111111111111111111111111111111111112 pour SOL)" },
        outputMint: { type: "string", description: "Adresse Mint du token cible" },
        amount: { type: "number", description: "Montant à swapper (unité atomique / lamports)" },
        slippageBps: { type: "number", description: "Slippage toléré en BPS (default 50 = 0.5%)" }
      },
      required: ["inputMint", "outputMint", "amount"]
    }
  }
];
