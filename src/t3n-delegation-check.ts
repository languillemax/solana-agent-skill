import dotenv from "dotenv";

import {
  discoverCheckDelegation,
  getNodeUrl,
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

const delegator =
  await getT3nLiveStatus();

if (
  !delegator.authenticated ||
  !delegator.did
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

const contract =
  `z:${orgTid}:solana-guard`;

const result =
  await discoverCheckDelegation(
    {
      baseUrl: getNodeUrl(),
      apiKey: agentApiKey,
    },
    {
      contract,
      pii_did: delegator.did,
      functions: [
        "authorize-solana-action",
      ],
      scopes: [],
    },
  );

console.log(
  JSON.stringify(
    {
      environment,
      contract,
      function:
        "authorize-solana-action",
      result,
    },
    null,
    2,
  ),
);
