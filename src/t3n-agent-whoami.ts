import dotenv from "dotenv";

import {
  discoverWhoami,
  getNodeUrl,
  setEnvironment,
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

const apiKey =
  process.env.T3N_AGENT_API_KEY?.trim();

const expectedDid =
  process.env.T3N_AGENT_DID?.trim();

const expectedOrgDid =
  process.env.T3N_ORG_DID?.trim();

if (!apiKey) {
  throw new Error(
    "T3N_AGENT_API_KEY is missing",
  );
}

if (!expectedDid) {
  throw new Error(
    "T3N_AGENT_DID is missing",
  );
}

const environment =
  process.env.T3N_ENV === "production"
    ? "production"
    : "sandbox";

setEnvironment(environment);

const baseUrl =
  getNodeUrl();

const whoami =
  await discoverWhoami({
    baseUrl,
    apiKey,
  });

const didMatches =
  whoami.did === expectedDid;

const orgMatches =
  expectedOrgDid
    ? whoami.organisations.includes(
        expectedOrgDid,
      )
    : undefined;

console.log(
  JSON.stringify(
    {
      success:
        didMatches &&
        orgMatches !== false,
      environment,
      did:
        whoami.did,
      didMatches,
      organisations:
        whoami.organisations,
      organisationMatches:
        orgMatches,
      owner:
        whoami.owner,
    },
    null,
    2,
  ),
);

if (!didMatches) {
  process.exitCode = 1;
}

if (orgMatches === false) {
  process.exitCode = 1;
}
