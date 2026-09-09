import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export async function getPortfolio(rpcUrl: string, walletAddress: string) {
  const connection = new Connection(rpcUrl, "confirmed");
  const pubkey = new PublicKey(walletAddress);

  const balanceLamports = await connection.getBalance(pubkey);
  const solBalance = balanceLamports / LAMPORTS_PER_SOL;

  // Interrogation Jupiter Price API v2
  let solPriceUsd = 0;
  try:
    const res = await fetch("https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112");
    const data = await res.json();
    solPriceUsd = parseFloat(data?.data?.So11111111111111111111111111111111111111112?.price || "0");
  catch (e) {
    // Fallback si indisponible
  }

  return {
    wallet: walletAddress,
    solBalance,
    solPriceUsd,
    totalValueUsd: solBalance * solPriceUsd
  };
}
