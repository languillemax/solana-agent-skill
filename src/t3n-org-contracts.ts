import dotenv from "dotenv";

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

const result =
  await tenant.contracts.listDetailed({
    tenantTarget:
      organisationDid,
  });

console.log(
  JSON.stringify(
    {
      environment,
      organisationDid,
      contracts:
        result.contracts,
      next:
        result.next,
    },
    null,
    2,
  ),
);
