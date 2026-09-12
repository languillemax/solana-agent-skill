import { Connection, Keypair } from "@solana/web3.js";

export interface PerpPositionParams {
  market: string;
  side: "long" | "short";
  leverage: number;
  collateralAmount: number;
  stopLossPrice?: number;
  takeProfitPrice?: number;
}

export interface PerpActionResult {
  success: boolean;
  executionMode: "simulation";
  positionId?: string;
  simulationId?: string;
  error?: string;
}

export async function getPerpMarketInfo(
  market: string = "SOL-PERP",
): Promise<any> {
  try {
    return {
      success: true,
      market,
      oraclePrice: 185.5,
      fundingRate24h: 0.00012,
      openInterest: 12500000,
      maxLeverage: 20,
      dataMode: "mock",
    };
  } catch (error) {
    return {
      success: false,
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
 * No Drift/Jupiter Perps transaction is built, signed or broadcast here.
 */
export async function openPerpPosition(
  _connection: Connection,
  _payer: Keypair,
  params: PerpPositionParams,
): Promise<PerpActionResult> {
  if (
    !params.market ||
    !Number.isFinite(params.collateralAmount) ||
    params.collateralAmount <= 0
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
    positionId:
      "perp_preview_" +
      Math.random().toString(36).substring(7),
    simulationId:
      "perp_open_preview_" + Date.now(),
  };
}

export async function closePerpPosition(
  _connection: Connection,
  _payer: Keypair,
  positionId: string,
): Promise<PerpActionResult> {
  if (!positionId) {
    return {
      success: false,
      executionMode: "simulation",
      error: "POSITION_ID_REQUIRED",
    };
  }

  return {
    success: true,
    executionMode: "simulation",
    positionId,
    simulationId:
      "perp_close_preview_" + Date.now(),
  };
}
