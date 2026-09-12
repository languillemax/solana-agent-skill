import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  T3nClient,
  TenantClient,
  createEthAuthInput,
  eth_get_address,
  getNodeUrl,
  loadWasmComponent,
  metamask_sign,
  setEnvironment,
} from "@terminal3/t3n-sdk";

dotenv.config({
  quiet: true,
});

const apiKey =
  process.env.T3N_API_KEY?.trim();

const organisationDid =
  process.env.T3N_ORG_DID?.trim();

if (!apiKey) {
  throw new Error(
    "T3N_API_KEY is missing",
  );
}

if (!organisationDid) {
  throw new Error(
    "T3N_ORG_DID is missing",
  );
}

const environment =
  process.env.T3N_ENV === "production"
    ? "production"
    : "sandbox";

setEnvironment(environment);

const wasmPath =
  resolve(
    "t3n-contract",
    "solana-guard",
    "target",
    "wasm32-wasip2",
    "release",
    "solana_guard.wasm",
  );

const contractWasm =
  await readFile(wasmPath);

const wasmComponent =
  await loadWasmComponent();

const address =
  eth_get_address(apiKey);

const client =
  new T3nClient({
    wasmComponent,
    trustAnchor: {
      unsafe_trust_server: true,
    },
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

const tenant =
  new TenantClient({
    t3n: client,
    baseUrl: getNodeUrl(),
  });

const existing =
  await tenant.contracts.list({
    tenantTarget:
      organisationDid,
  });

const alreadyExists =
  existing.some(
    (name) =>
      name.endsWith(
        ":solana-guard",
      ),
  );

if (alreadyExists) {
  throw new Error(
    "solana-guard already exists; refusing duplicate publication",
  );
}

console.log(
  JSON.stringify(
    {
      environment,
      tenant: organisationDid,
      tail: "solana-guard",
      version: "0.1.0",
      wasmBytes:
        contractWasm.byteLength,
      publishing: true,
    },
    null,
    2,
  ),
);

const result =
  await tenant.contracts.publish(
    {
      tail: "solana-guard",
      version: "0.1.0",
      wasm: contractWasm,
    },
    {
      tenantTarget:
        organisationDid,
    },
  );

console.log(
  JSON.stringify(
    {
      success: true,
      contract:
        result.name,
      contractId:
        result.contract_id,
      version: "0.1.0",
    },
    null,
    2,
  ),
);
