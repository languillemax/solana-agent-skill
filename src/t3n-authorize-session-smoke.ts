import dotenv from "dotenv";
import {
  T3nClient,
  createEthAuthInput,
  eth_get_address,
  loadWasmComponent,
  metamask_sign,
  setEnvironment,
} from "@terminal3/t3n-sdk";

dotenv.config({ path: ".env", quiet: true });

async function main() {
  const apiKey = process.env.T3N_API_KEY?.trim();
  const orgDid = process.env.T3N_ORG_DID?.trim();

  if (!apiKey || !orgDid) {
    throw new Error("Missing T3N_API_KEY or T3N_ORG_DID");
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

  const result = await client.execute({
    contract_id: contractId,
    contract_version: "0.1.0",
    function_name: "authorize-solana-action",
    input: {
      action: "SOL_TRANSFER",
      amount_sol: 1,
      destination: "smoke-test-destination",
    },
  });

  console.log(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
