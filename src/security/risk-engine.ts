import { z } from "zod";

export interface RiskConfig {
  maxAmountSol: number;
  maxLeverage: number;
  maxSlippageBps: number;
}

export const DEFAULT_RISK_CONFIG: RiskConfig = {
  maxAmountSol: 10,
  maxLeverage: 10,
  maxSlippageBps: 500,
};

export const riskConfigSchema = z.object({
  maxAmountSol: z.number().finite().positive(),
  maxLeverage: z.number().finite().min(1),
  maxSlippageBps: z.number().finite().min(1),
});

export function validateRiskLimits(
  params: {
    amount?: number;
    amountSol?: number;
    leverage?: number;
    slippageBps?: number;
    slippage?: number;
  },
  config: RiskConfig = DEFAULT_RISK_CONFIG,
) {
  const amount = params.amount ?? params.amountSol;

  if (amount !== undefined) {
    if (!Number.isFinite(amount) || amount <= 0) {
      return {
        valid: false,
        code: "INVALID_AMOUNT",
        message: "Amount must be a finite positive number",
      };
    }

    if (amount > config.maxAmountSol) {
      return {
        valid: false,
        code: "RISK_LIMIT_EXCEEDED",
        message: "Amount exceeds safety limit",
      };
    }
  }

  if (params.leverage !== undefined) {
    if (!Number.isFinite(params.leverage) || params.leverage < 1) {
      return {
        valid: false,
        code: "INVALID_LEVERAGE",
        message: "Leverage must be a finite number >= 1",
      };
    }

    if (params.leverage > config.maxLeverage) {
      return {
        valid: false,
        code: "LEVERAGE_EXCEEDED",
        message: "Leverage exceeds safety limit",
      };
    }
  }

  const slippageBps =
    params.slippageBps ??
    (params.slippage !== undefined ? params.slippage * 100 : undefined);

  if (slippageBps !== undefined) {
    if (!Number.isFinite(slippageBps) || slippageBps < 0) {
      return {
        valid: false,
        code: "INVALID_SLIPPAGE",
        message: "Slippage must be a finite non-negative number",
      };
    }

    if (slippageBps > config.maxSlippageBps) {
      return {
        valid: false,
        code: "SLIPPAGE_EXCEEDED",
        message: "Slippage exceeds safety limit",
      };
    }
  }

  return { valid: true };
}
