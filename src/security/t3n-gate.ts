import {
  getT3nLiveStatus,
  type T3nLiveStatus,
} from "../t3n-live.js";

export interface T3nGateResult {
  approved: boolean;
  did?: string;
  address?: string;
  error?: string;
}

export type T3nStatusProvider =
  () => Promise<T3nLiveStatus>;

export async function t3nSecurityGate(
  statusProvider: T3nStatusProvider =
    getT3nLiveStatus,
): Promise<T3nGateResult> {
  const status =
    await statusProvider();

  if (!status.configured) {
    return {
      approved: false,
      error:
        "T3N_NOT_CONFIGURED",
    };
  }

  if (!status.authenticated) {
    return {
      approved: false,
      error:
        status.error ||
        "T3N_AUTHENTICATION_FAILED",
    };
  }

  if (!status.did) {
    return {
      approved: false,
      error:
        "T3N_DID_MISSING",
    };
  }

  return {
    approved: true,
    did: status.did,
    address: status.address,
  };
}
