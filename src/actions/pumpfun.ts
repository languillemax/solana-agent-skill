import {
  Connection,
  Keypair,
  VersionedTransaction,
} from "@solana/web3.js";
import { simulationGate } from "../security/simulation-gate.js";
import { validateRiskLimits } from "../security/risk-engine.js";

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
  simulationLogs?: string[];
}

export async function executePumpFunTrade(
  connection: Connection,
  payer: Keypair,
  params: PumpFunTradeParams,
): Promise<PumpFunTradeResult> {
  try {
    const risk = validateRiskLimits({
      amount: params.amount,
      slippageBps: params.slippageBps,
    });

    if (!risk.valid) {
      return {
        success: false,
        error: `${risk.code}: ${risk.message}`,
      };
    }

    const slippageBps = params.slippageBps ?? 100;
    const slippagePercent = slippageBps / 100;
    const priorityFee = params.priorityFee ?? 0.00005;

    if (
      !Number.isFinite(priorityFee) ||
      priorityFee < 0 ||
      priorityFee > 0.01
    ) {
      return {
        success: false,
        error: "INVALID_PRIORITY_FEE: priorityFee must be between 0 and 0.01 SOL",
      };
    }

    const response = await fetch("https://pumpportal.fun/api/trade-local", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "solana-agent-skill/1.0",
      },
      body: JSON.stringify({
        publicKey: payer.publicKey.toBase58(),
        action: params.action,
        mint: params.mint,
        denominatedInSol: params.denominatedInSol ? "true" : "false",
        amount: params.amount,
        slippage: slippagePercent,
        priorityFee,
        pool: "pump",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      return {
        success: false,
        error: `PumpPortal API error (${response.status}): ${errorText}`,
      };
    }

    const arrayBuf = await response.arrayBuffer();
    const tx = VersionedTransaction.deserialize(new Uint8Array(arrayBuf));

    /*
     * SECURITY INVARIANT:
     * simulation happens on the unsigned transaction.
     * Signing is unreachable when simulation fails.
     */
    const simulation = await simulationGate(connection, tx);

    if (!simulation.approved) {
      return {
        success: false,
        error: `${simulation.code}: ${simulation.message}`,
        simulationLogs: simulation.logs,
      };
    }

    tx.sign([payer]);

    const signature = await connection.sendTransaction(tx, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
      maxRetries: 2,
    });

    return {
      success: true,
      signature,
      simulationLogs: simulation.logs,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getPumpFunTokenInfo(mint: string): Promise<any> {
  try {
    const response = await fetch(
      `https://frontend-api.pump.fun/coins/${encodeURIComponent(mint)}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "solana-agent-skill/1.0",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `Impossible de recuperer les infos Pump.fun: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
