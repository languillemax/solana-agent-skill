import { z } from "zod";
import {
  DEFAULT_RISK_CONFIG,
  validateRiskLimits,
  type RiskConfig,
} from "./security/risk-engine.js";

export { DEFAULT_RISK_CONFIG, validateRiskLimits };
export type { RiskConfig };

const publicKeySchema = z.string().min(32).max(44);

export const pumpfunBuySchema = z.object({
  mint: publicKeySchema,
  amountSol: z.number().finite().positive("Amount must be strictly positive"),
  slippage: z.number().finite().min(0.1).max(5).default(1),
});

export const pumpfunTradeSchema = z.object({
  mint: publicKeySchema,
  action: z.enum(["buy", "sell"]),
  amount: z.number().finite().positive("Amount must be strictly positive"),
  denominatedInSol: z.boolean().default(true),
  slippageBps: z.number().finite().min(1).max(500).default(100),
  priorityFee: z.number().finite().nonnegative().max(0.01).optional(),
});

export const lendingSchema = z.object({
  protocol: z.enum(["kamino", "marginfi"]),
  asset: z.string().min(1).max(32),
  amount: z.number().finite().positive("Amount must be strictly positive"),
  action: z.enum(["deposit", "withdraw", "borrow", "repay"]),
});

export const perpsSchema = z.object({
  market: z.string().min(1).max(64),
  side: z.enum(["long", "short"]),
  amount: z.number().finite().positive("Amount must be strictly positive"),
  leverage: z.number().finite().min(1).max(10, "Leverage cannot exceed 10x"),
});

export const squadsCreateSchema = z.object({
  members: z.array(publicKeySchema).min(1).max(10),
  threshold: z.number().int().min(1),
});

export const token2022TransferSchema = z.object({
  mint: publicKeySchema,
  destination: publicKeySchema,
  amount: z.number().finite().positive(),
  transferFeeBasisPoints: z.number().int().min(0).max(10000).default(0),
});

export const SOLANA_AGENT_TOOLS = [
  {
    name: "PUMPFUN_BUY",
    description: "Acheter un token sur Pump.fun",
    schema: pumpfunBuySchema,
  },
  {
    name: "LENDING_ACTION",
    description: "Déposer ou emprunter sur Kamino/Marginfi",
    schema: lendingSchema,
  },
  {
    name: "PERPS_OPEN",
    description: "Ouvrir une position sur Drift/Jupiter Perps",
    schema: perpsSchema,
  },
];

/**
 * Compatibility helper for existing callers/tests.
 *
 * This is intentionally NOT presented as a real blockchain simulation.
 * Real transaction simulation belongs to src/security/simulation-gate.ts.
 */
export async function simulateTransaction(
  txData: unknown,
  forceFail = false,
) {
  if (forceFail) {
    return {
      success: false,
      error: {
        code: "SIMULATION_FAILED",
        message: "Simulation explicitly failed",
      },
    };
  }

  const data =
    typeof txData === "object" && txData !== null
      ? (txData as Record<string, unknown>)
      : {};

  const amount =
    typeof data.amount === "number"
      ? data.amount
      : typeof data.amountSol === "number"
        ? data.amountSol
        : undefined;

  if (amount !== undefined && amount > 1000) {
    return {
      success: false,
      error: {
        code: "SIMULATION_FAILED",
        message: "Simulation rejected unsafe amount",
      },
    };
  }

  return {
    success: true,
    logs: [
      "Logical validation passed",
      "Real transaction simulation must be performed by simulationGate()",
    ],
  };
}
