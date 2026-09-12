import dotenv from "dotenv";

import {
  getNodeUrl,
  invoke,
  setEnvironment,
} from "@terminal3/t3n-sdk";

import {
  getT3nLiveStatus,
} from "./t3n-live.js";

dotenv.config({
  path: ".env",
  quiet: true,
});

dotenv.config({
  path: ".env.t3n-agent.local",
  override: true,
  quiet: true,
});

const agentApiKey =
  process.env.T3N_AGENT_API_KEY?.trim();

const organisationDid =
  process.env.T3N_ORG_DID?.trim();

if (!agentApiKey) {
  throw new Error(
    "T3N_AGENT_API_KEY is missing",
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

const adminStatus =
  await getT3nLiveStatus();

if (
  !adminStatus.authenticated ||
  !adminStatus.did
) {
  throw new Error(
    "Unable to resolve delegator DID",
  );
}

const orgTid =
  organisationDid.replace(
    /^did:t3n:/,
    "",
  );

const contractId =
  `z:${orgTid}:solana-guard`;

const request = {
  contract_id: contractId,
  contract_version: "0.1.0",
  function_name:
    "authorize-solana-action",
  pii_did: adminStatus.did,
  input: {
    action: "SOL_TRANSFER",
    amount_sol: 1,
    destination:
      "smoke-test-destination",
  },
};

const result =
  await invoke({
    baseUrl: getNodeUrl(),
    apiKey: agentApiKey,
    request,
  });

console.log(
  JSON.stringify(
    {
      success: true,
      environment,
      contractId,
      function:
        request.function_name,
      result,
    },
    null,
    2,
  ),
);
