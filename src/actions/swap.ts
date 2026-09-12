import { SolanaAgent } from "../agent.js";
import fetch from "cross-fetch";
import { VersionedTransaction } from "@solana/web3.js";
import { simulationGate } from "../security/simulation-gate.js";
import { validateRiskLimits } from "../security/risk-engine.js";

export interface SwapParams {
  inputMint: string;
  outputMint: string;
  amountLamports: number;
  slippageBps?: number;
}

export async function executeJupiterSwap(
  agent: SolanaAgent,
  params: SwapParams,
): Promise<string> {
  const signer = agent.requireSigner();

  if (
    !Number.isSafeInteger(params.amountLamports) ||
    params.amountLamports <= 0
  ) {
    throw new Error(
      "INVALID_AMOUNT: amountLamports must be a positive safe integer",
    );
  }

  const slippageBps = params.slippageBps ?? 50;

  const risk = validateRiskLimits({
    slippageBps,
  });

  if (!risk.valid) {
    throw new Error(`${risk.code}: ${risk.message}`);
  }

  const baseUrl =
    process.env.JUPITER_API_URL || "https://api.jup.ag/swap/v1";

  const quoteUrl = new URL(`${baseUrl}/quote`);
  quoteUrl.searchParams.set("inputMint", params.inputMint);
  quoteUrl.searchParams.set("outputMint", params.outputMint);
  quoteUrl.searchParams.set("amount", String(params.amountLamports));
  quoteUrl.searchParams.set("slippageBps", String(slippageBps));

  const quoteRes = await fetch(quoteUrl.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "solana-agent-skill/1.0",
    },
  });

  if (!quoteRes.ok) {
    throw new Error(`Jupiter quote HTTP ${quoteRes.status}`);
  }

  const quoteData: any = await quoteRes.json();

  if (!quoteData || quoteData.error) {
    throw new Error(
      `Erreur Quote Jupiter: ${JSON.stringify(quoteData)}`,
    );
  }

  const swapRes = await fetch(`${baseUrl}/swap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "solana-agent-skill/1.0",
    },
    body: JSON.stringify({
      quoteResponse: quoteData,
      userPublicKey: signer.publicKey.toBase58(),
      wrapAndUnwrapSol: true,
    }),
  });

  if (!swapRes.ok) {
    throw new Error(`Jupiter swap HTTP ${swapRes.status}`);
  }

  const swapData: any = await swapRes.json();

  if (!swapData?.swapTransaction) {
    throw new Error("Jupiter response did not contain swapTransaction");
  }

  const transaction = VersionedTransaction.deserialize(
    Buffer.from(swapData.swapTransaction, "base64"),
  );

  /*
   * SECURITY INVARIANT:
   * never sign a transaction that has not passed RPC simulation.
   */
  const simulation = await simulationGate(agent.connection, transaction);

  if (!simulation.approved) {
    throw new Error(
      `${simulation.code}: ${simulation.message ?? "Transaction simulation failed"}`,
    );
  }

  transaction.sign([signer]);

  return await agent.connection.sendRawTransaction(transaction.serialize(), {
    skipPreflight: false,
    maxRetries: 2,
  });
}
