import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";

export interface PumpFunTradeParams {
  mint: string;
  action: "buy" | "sell";
  amount: number;
  denominatedInSol: boolean;
  slippageBps?: number;
  priorityFee?: number;
}

export interface PumpFunTradeResult {
  success: boolean;
  signature?: string;
  error?: string;
}

export async function executePumpFunTrade(
  connection: Connection,
  payer: Keypair,
  params: PumpFunTradeParams
): Promise<PumpFunTradeResult> {
  try {
    const slippage = params.slippageBps ? params.slippageBps / 100 : 5;
    const priorityFee = params.priorityFee ?? 0.00005;

    const response = await fetch("https://pumpportal.fun/api/trade-local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey: payer.publicKey.toBase58(),
        action: params.action,
        mint: params.mint,
        denominatedInSol: params.denominatedInSol ? "true" : "false",
        amount: params.amount,
        slippage,
        priorityFee,
        pool: "pump",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `PumpPortal API error (${response.status}): ${errorText}` };
    }

    const arrayBuf = await response.arrayBuffer();
    const tx = VersionedTransaction.deserialize(new Uint8Array(arrayBuf));
    tx.sign([payer]);

    const signature = await connection.sendTransaction(tx, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    return { success: true, signature };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getPumpFunTokenInfo(mint: string): Promise<any> {
  try {
    const response = await fetch(`https://frontend-api.pump.fun/coins/${mint}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error: any) {
    throw new Error(`Impossible de recuperer les infos Pump.fun: ${error.message}`);
  }
}
