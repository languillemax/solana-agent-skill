import {
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { SolanaAgent } from "../agent.js";
import { simulationGate } from "../security/simulation-gate.js";
import { validateRiskLimits } from "../security/risk-engine.js";

async function simulateSignAndSend(
  agent: SolanaAgent,
  transaction: Transaction,
): Promise<string> {
  const signer = agent.requireSigner();

  const latestBlockhash = await agent.connection.getLatestBlockhash("confirmed");

  transaction.feePayer = signer.publicKey;
  transaction.recentBlockhash = latestBlockhash.blockhash;

  /*
   * SECURITY INVARIANT:
   * the transaction MUST pass RPC simulation before signing.
   */
  const simulation = await simulationGate(agent.connection, transaction);

  if (!simulation.approved) {
    throw new Error(
      `${simulation.code}: ${
        simulation.message ?? "Transaction simulation failed"
      }`,
    );
  }

  transaction.sign(signer);

  const signature = await agent.connection.sendRawTransaction(
    transaction.serialize(),
    {
      skipPreflight: false,
      maxRetries: 2,
      preflightCommitment: "confirmed",
    },
  );

  await agent.connection.confirmTransaction(
    {
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    },
    "confirmed",
  );

  return signature;
}

export async function transferSOL(
  agent: SolanaAgent,
  destination: string,
  amountSol: number,
): Promise<string> {
  const signer = agent.requireSigner();

  const risk = validateRiskLimits({ amountSol });

  if (!risk.valid) {
    throw new Error(`${risk.code}: ${risk.message}`);
  }

  if (!Number.isFinite(amountSol) || amountSol <= 0) {
    throw new Error("INVALID_AMOUNT: amountSol must be positive");
  }

  const destinationPubkey = new PublicKey(destination);

  const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);

  if (!Number.isSafeInteger(lamports) || lamports <= 0) {
    throw new Error("INVALID_AMOUNT: invalid lamport amount");
  }

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: signer.publicKey,
      toPubkey: destinationPubkey,
      lamports,
    }),
  );

  return simulateSignAndSend(agent, transaction);
}

export async function transferSPL(
  agent: SolanaAgent,
  mintAddress: string,
  destinationOwner: string,
  amount: number,
): Promise<string> {
  const signer = agent.requireSigner();

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error(
      "INVALID_AMOUNT: SPL token amount must be a positive safe integer",
    );
  }

  const mint = new PublicKey(mintAddress);
  const destinationOwnerPubkey = new PublicKey(destinationOwner);

  const sourceAta = await getAssociatedTokenAddress(
    mint,
    signer.publicKey,
  );

  const destinationAta = await getAssociatedTokenAddress(
    mint,
    destinationOwnerPubkey,
  );

  const transaction = new Transaction().add(
    createTransferInstruction(
      sourceAta,
      destinationAta,
      signer.publicKey,
      amount,
    ),
  );

  return simulateSignAndSend(agent, transaction);
}

/*
 * Backward-compatible aliases.
 * Keep these exports if other integrations rely on the older naming.
 */
export const transferSol = transferSOL;
export const transferToken = transferSPL;
