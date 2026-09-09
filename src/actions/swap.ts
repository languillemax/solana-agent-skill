import { SolanaAgent } from '../agent.js';
import fetch from 'cross-fetch';
import { VersionedTransaction } from '@solana/web3.js';

export interface SwapParams {
  inputMint: string;
  outputMint: string;
  amountLamports: number;
  slippageBps?: number;
}

export async function executeJupiterSwap(agent: SolanaAgent, params: SwapParams): Promise<string> {
  if (!agent.keypair) throw new Error("Clé privée requise pour signer le swap.");

  const slippage = params.slippageBps || 50;
  const baseUrl = process.env.JUPITER_API_URL || 'https://api.jup.ag/swap/v1';
  const quoteUrl = `${baseUrl}/quote?inputMint=${params.inputMint}&outputMint=${params.outputMint}&amount=${params.amountLamports}&slippageBps=${slippage}`;
  
  const quoteRes = await fetch(quoteUrl, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'solana-agent-skill/1.0' }
  });
  const quoteData = await quoteRes.json();

  if (!quoteData || quoteData.error) {
    throw new Error(`Erreur Quote Jupiter: ${JSON.stringify(quoteData)}`);
  }

  const swapRes = await fetch(`${baseUrl}/swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'solana-agent-skill/1.0' },
    body: JSON.stringify({
      quoteResponse: quoteData,
      userPublicKey: agent.keypair.publicKey.toBase58(),
      wrapAndUnwrapSol: true,
    })
  });

  const { swapTransaction } = await swapRes.json();
  const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
  const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
  
  transaction.sign([agent.keypair]);
  
  return await agent.connection.sendRawTransaction(transaction.serialize(), {
    skipPreflight: false,
    maxRetries: 2
  });
}
