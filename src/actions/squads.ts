import {
  Connection,
  Keypair,
} from "@solana/web3.js";

export interface CreateMultisigParams {
  threshold: number;
  members: string[];
}

export interface MultisigProposalParams {
  multisigPda: string;
  transactionIndex: number;
}

export interface SquadsSimulationResult {
  success: boolean;
  executionMode: "simulation";
  simulationId?: string;
  multisigPda?: string;
  proposalPda?: string;
  error?: string;
}

/**
 * Preview-only adapter.
 *
 * No Squads transaction is built, signed or broadcast here.
 */
export async function createMultisigAccount(
  _connection: Connection,
  _payer: Keypair,
  params: CreateMultisigParams,
): Promise<SquadsSimulationResult> {
  if (
    !params.members ||
    params.members.length === 0 ||
    params.threshold <= 0
  ) {
    return {
      success: false,
      executionMode: "simulation",
      error: "INVALID_MEMBERS_OR_THRESHOLD",
    };
  }

  if (params.threshold > params.members.length) {
    return {
      success: false,
      executionMode: "simulation",
      error: "INVALID_THRESHOLD",
    };
  }

  return {
    success: true,
    executionMode: "simulation",
    multisigPda:
      "squads_preview_" +
      Math.random().toString(36).substring(7),
    simulationId:
      "squads_create_preview_" + Date.now(),
  };
}

export async function createMultisigProposal(
  _connection: Connection,
  _payer: Keypair,
  params: MultisigProposalParams,
): Promise<SquadsSimulationResult> {
  if (!params.multisigPda) {
    return {
      success: false,
      executionMode: "simulation",
      error: "MULTISIG_PDA_REQUIRED",
    };
  }

  return {
    success: true,
    executionMode: "simulation",
    proposalPda:
      "squads_proposal_preview_" +
      Math.random().toString(36).substring(7),
    simulationId:
      "squads_proposal_preview_" + Date.now(),
  };
}
