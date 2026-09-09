import { z } from 'zod';

export const pumpfunBuySchema = z.object({
  mint: z.string().min(32).max(44),
  amountSol: z.number().positive("Amount must be strictly positive"),
  slippage: z.number().min(0.1).max(50).default(1)
});

export const lendingSchema = z.object({
  protocol: z.enum(['kamino', 'marginfi']),
  asset: z.string().min(1),
  amount: z.number().positive("Amount must be strictly positive"),
  action: z.enum(['deposit', 'withdraw', 'borrow', 'repay'])
});

export const perpsSchema = z.object({
  market: z.string(),
  side: z.enum(['long', 'short']),
  amount: z.number().positive("Amount must be strictly positive"),
  leverage: z.number().min(1).max(10, "Leverage cannot exceed 10x")
});

export interface RiskConfig {
  maxAmountSol: number;
  maxLeverage: number;
}

export const DEFAULT_RISK_CONFIG: RiskConfig = {
  maxAmountSol: 10,
  maxLeverage: 10
};

export function validateRiskLimits(params: { amount?: number; amountSol?: number; leverage?: number }, config = DEFAULT_RISK_CONFIG) {
  const amountToValidate = params.amount ?? params.amountSol;
  if (amountToValidate !== undefined && amountToValidate > config.maxAmountSol) {
    return { valid: false, code: 'RISK_LIMIT_EXCEEDED', message: 'Amount exceeds safety limit' };
  }
  if (params.leverage !== undefined && params.leverage > config.maxLeverage) {
    return { valid: false, code: 'LEVERAGE_EXCEEDED', message: 'Leverage exceeds safety limit' };
  }
  return { valid: true };
}

export async function simulateTransaction(txData: any, forceFail = false) {
  if (forceFail || (txData && (txData.amount > 1000 || txData.amountSol > 1000))) {
    return { success: false, error: { code: 'SIMULATION_FAILED', message: 'Instruction execution reverted' } };
  }
  return { success: true, logs: ['Program Log: Instruction: Execute', 'Program consumed 12400 compute units'] };
}

export const SOLANA_AGENT_TOOLS = [
  { name: 'PUMPFUN_BUY', description: 'Acheter un token sur Pump.fun', schema: pumpfunBuySchema },
  { name: 'LENDING_ACTION', description: 'Déposer ou emprunter sur Kamino/Marginfi', schema: lendingSchema },
  { name: 'PERPS_OPEN', description: 'Ouvrir une position sur Drift/Jupiter Perps', schema: perpsSchema }
];
