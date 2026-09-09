import { SolanaAgent } from '../agent.js';
import { PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';

export async function transferSol(agent: SolanaAgent, recipient: string, amountSol: number): Promise<string> {
  if (!agent.keypair) throw new Error("Clé privée requise pour signer le transfert.");

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: agent.keypair.publicKey,
      toPubkey: new PublicKey(recipient),
      lamports: amountSol * 1e9,
    })
  );

  return await sendAndConfirmTransaction(agent.connection, transaction, [agent.keypair]);
}

export async function transferSplToken(
  agent: SolanaAgent,
  tokenMint: string,
  recipient: string,
  amount: number
): Promise<string> {
  if (!agent.keypair) throw new Error("Clé privée requise.");

  const mintPubkey = new PublicKey(tokenMint);
  const recipientPubkey = new PublicKey(recipient);

  const sourceAta = await getAssociatedTokenAddress(mintPubkey, agent.keypair.publicKey);
  const destAta = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);

  const transaction = new Transaction().add(
    createTransferInstruction(sourceAta, destAta, agent.keypair.publicKey, amount)
  );

  return await sendAndConfirmTransaction(agent.connection, transaction, [agent.keypair]);
}
