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
  positionId?: string;
  signature?: string;
  error?: string;
}

export async function getPerpMarketInfo(market: string = "SOL-PERP"): Promise<any> {
  try {
    return {
      success: true,
      market,
      oraclePrice: 185.50,
      fundingRate24h: 0.00012,
      openInterest: 12500000,
      maxLeverage: 20
    };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function openPerpPosition(
  connection: Connection,
  payer: Keypair,
  params: PerpPositionParams
): Promise<PerpActionResult> {
  try {
    if (!params.market || !params.collateralAmount || params.collateralAmount <= 0) {
      return { success: false, error: "Paramètres de position invalides" };
    }
    return {
      success: true,
      positionId: "perp_pos_" + Math.random().toString(36).substring(7),
      signature: "simulated_perp_tx_" + Date.now()
    };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function closePerpPosition(
  connection: Connection,
  payer: Keypair,
  positionId: string
): Promise<PerpActionResult> {
  try {
    if (!positionId) return { success: false, error: "positionId requis" };
    return {
      success: true,
      positionId,
      signature: "simulated_close_perp_tx_" + Date.now()
    };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}
