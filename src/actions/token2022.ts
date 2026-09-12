import {
  Connection,
  Keypair,
} from "@solana/web3.js";

export interface Token2022TransferParams {
  mint: string;
  destination: string;
  amount: number;
}

export interface Token2022SimulationResult {
  success: boolean;
  executionMode: "simulation";
  simulationId?: string;
  error?: string;
}

/**
 * Preview-only adapter.
 *
 * No Token-2022 instruction is built, signed or broadcast here.
 */
export async function transferToken2022WithFee(
  _connection: Connection,
  _payer: Keypair,
  params: Token2022TransferParams,
): Promise<Token2022SimulationResult> {
  if (
    !params.mint ||
    !params.destination ||
    !Number.isFinite(params.amount) ||
    params.amount <= 0
  ) {
    return {
      success: false,
      executionMode: "simulation",
      error: "INVALID_PARAMETERS",
    };
  }

  return {
    success: true,
    executionMode: "simulation",
    simulationId:
      "token2022_transfer_preview_" + Date.now(),
  };
}
