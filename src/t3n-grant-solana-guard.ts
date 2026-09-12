import dotenv from "dotenv";

import {
  T3nClient,
  createEthAuthInput,
  createOrgDataClientFromSession,
  eth_get_address,
  getNodeUrl,
  loadWasmComponent,
  metamask_sign,
  setEnvironment,
  type BoundGrant,
} from "@terminal3/t3n-sdk";

dotenv.config({
  path: ".env",
  quiet: true,
});

dotenv.config({
  path: ".env.t3n-agent.local",
  override: true,
  quiet: true,
});

const adminApiKey =
  process.env.T3N_API_KEY?.trim();

const organisationDid =
  process.env.T3N_ORG_DID?.trim();

const agentDid =
  process.env.T3N_AGENT_DID?.trim();

if (!adminApiKey) {
  throw new Error(
    "T3N_API_KEY is missing",
  );
}

if (!organisationDid) {
  throw new Error(
    "T3N_ORG_DID is missing",
  );
}

if (!agentDid) {
  throw new Error(
    "T3N_AGENT_DID is missing",
  );
}

const environment =
  process.env.T3N_ENV === "production"
    ? "production"
    : "sandbox";

setEnvironment(environment);

const orgTid =
  organisationDid.replace(
    /^did:t3n:/,
    "",
  );

const contractId =
  `z:${orgTid}:solana-guard`;

const grant = {
  scriptName: contractId,
  versionReq: "0.1.0",
  functions: [
    "authorize-solana-action",
  ],
  allowedHosts: [],
};

const wasmComponent =
  await loadWasmComponent();

const address =
  eth_get_address(adminApiKey);

const client =
  new T3nClient({
    wasmComponent,

    // Sandbox only.
    trustAnchor: {
      unsafe_trust_server: true,
    },

    handlers: {
      EthSign:
        metamask_sign(
          address,
          undefined,
          adminApiKey,
        ),
    },
  });

await client.handshake();

await client.authenticate(
  createEthAuthInput(address),
);

console.log(
  JSON.stringify(
    {
      environment,
      organisationDid,
      agentDid,
      grant: {
        scriptName:
          grant.scriptName,
        versionReq:
          grant.versionReq,
        functions:
          grant.functions,
        allowedHosts:
          grant.allowedHosts,
      },
      mutationEnabled: true,
    },
    null,
    2,
  ),
);

const result =
  await client.updateAgentAuth(
    agentDid,
    grant,
  );

console.log(
  JSON.stringify(
    {
      success: true,
      preservedRows:
        result.preservedRows,
    },
    null,
    2,
  ),
);
