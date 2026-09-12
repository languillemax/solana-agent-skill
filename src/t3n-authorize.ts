import {
  T3nClient,
  createEthAuthInput,
  eth_get_address,
  loadWasmComponent,
  metamask_sign,
  setEnvironment,
} from "@terminal3/t3n-sdk";

export interface SolanaGuardInput {
  action: "SOL_TRANSFER" | "SWAP" | "PUMPFUN";
  amount_sol: number;
  destination?: string;
  slippage_bps?: number;
}

export interface SolanaGuardResult {
  authorized: boolean;
  action: string;
  reason: string | null;
  max_amount_sol: number;
  max_slippage_bps: number;
}

export async function authorizeSolanaActionViaT3n(
  input: SolanaGuardInput,
): Promise<SolanaGuardResult> {
  const apiKey = process.env.T3N_API_KEY?.trim();
  const orgDid = process.env.T3N_ORG_DID?.trim();

  if (!apiKey || !orgDid) {
    throw new Error("T3N_NOT_CONFIGURED");
  }

  const environment =
    process.env.T3N_ENV === "production"
      ? "production"
      : "sandbox";

  setEnvironment(environment);

  const wasmComponent = await loadWasmComponent();
  const address = eth_get_address(apiKey);

  const client = new T3nClient({
    wasmComponent,
    trustAnchor: {
      unsafe_trust_server: true,
    } as const,
    handlers: {
      EthSign: metamask_sign(
        address,
        undefined,
        apiKey,
      ),
    },
  });

  await client.handshake();
  await client.authenticate(
    createEthAuthInput(address),
  );

  const contractId =
    `z:${orgDid.replace(/^did:t3n:/, "")}:solana-guard`;

  const raw = await client.execute({
    contract_id: contractId,
    contract_version: "0.1.0",
    function_name: "authorize-solana-action",
    input,
  });

  return JSON.parse(raw) as SolanaGuardResult;
}
