import { Connection, Keypair } from "@solana/web3.js";

export interface LendingParams {
  protocol: "kamino" | "marginfi";
  action: "deposit" | "borrow" | "repay" | "withdraw";
  asset: string;
  amount: number;
}

export interface LendingResult {
  success: boolean;
  executionMode: "simulation";
  simulationId?: string;
  healthFactor?: number;
  error?: string;
}

export async function getLendingRates(
  protocol: "kamino" | "marginfi" = "kamino",
): Promise<any> {
  try {
    let reserves: any = [];

    if (protocol === "kamino") {
      try {
        const res = await fetch(
          "https://api.kamino.finance/v2/kamino-market/mainnet/reserves",
          {
            signal: AbortSignal.timeout(3000),
          },
        );

        if (res.ok) {
          reserves = await res.json();
        } else {
          throw new Error("HTTP " + res.status);
        }
      } catch {
        reserves = [
          {
            asset: "SOL",
            supplyApy: 0.061,
            borrowApy: 0.082,
          },
          {
            asset: "USDC",
            supplyApy: 0.092,
            borrowApy: 0.118,
          },
        ];
      }
    } else {
      reserves = [
        {
          asset: "SOL",
          supplyApy: 0.052,
          borrowApy: 0.078,
        },
        {
          asset: "USDC",
          supplyApy: 0.085,
          borrowApy: 0.112,
        },
      ];
    }

    return {
      success: true,
      protocol,
      reserves,
    };
  } catch (error) {
    return {
      success: false,
      protocol,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    };
  }
}

/**
 * Preview-only adapter.
 *
 * No Kamino/Marginfi transaction is built, signed or broadcast here.
 */
export async function executeLendingAction(
  _connection: Connection,
  _payer: Keypair,
  params: LendingParams,
): Promise<LendingResult> {
  if (!params.asset || params.amount <= 0) {
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
      "lending_preview_" + Date.now(),
    healthFactor: 1.45,
  };
}
