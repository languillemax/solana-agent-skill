import {
  Connection,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

export type SolanaTransaction = Transaction | VersionedTransaction;

export interface SimulationGateResult {
  approved: boolean;
  code?: string;
  message?: string;
  logs: string[];
}

export async function simulationGate(
  connection: Connection,
  transaction: SolanaTransaction,
): Promise<SimulationGateResult> {
  try {
    const result = await connection.simulateTransaction(transaction as VersionedTransaction, {
      sigVerify: false,
      replaceRecentBlockhash: true,
      commitment: "confirmed",
    });

    const logs = result.value.logs ?? [];

    if (result.value.err) {
      return {
        approved: false,
        code: "SIMULATION_FAILED",
        message: `Solana simulation failed: ${JSON.stringify(result.value.err)}`,
        logs,
      };
    }

    return {
      approved: true,
      logs,
    };
  } catch (error) {
    return {
      approved: false,
      code: "SIMULATION_ERROR",
      message: error instanceof Error ? error.message : String(error),
      logs: [],
    };
  }
}
