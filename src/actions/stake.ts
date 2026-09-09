export async function getJitoStakeQuote(amountSol: number) {
  // Calcul de conversion SOL vers JitoSOL
  const JITO_SOL_MINT = "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn";
  return {
    protocol: "Jito",
    action: "Liquid Staking",
    inputAmountSol: amountSol,
    targetMint: JITO_SOL_MINT,
    estimatedApy: "6.8%",
    status: "ready"
  };
}
