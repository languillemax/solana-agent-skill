import dotenv from "dotenv";

import {
  discoverListContracts,
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

if (!apiKey) {
  throw new Error(
    "T3N_AGENT_API_KEY is missing",
  );
}

const environment =
  process.env.T3N_ENV === "production"
    ? "production"
    : "sandbox";

setEnvironment(environment);

const result =
  await discoverListContracts(
    {
      baseUrl: getNodeUrl(),
      apiKey,
    },
    {},
  );

console.log(
  JSON.stringify(
    {
      environment,
      scope: result.scope,
      contracts:
        result.contracts.map(
          (contract) => ({
            name: contract.name,
            shortName:
              contract.short_name,
            version:
              contract.version,
            summary:
              contract.summary,
          }),
        ),
      nextOffset:
        result.next_offset,
    },
    null,
    2,
  ),
);
