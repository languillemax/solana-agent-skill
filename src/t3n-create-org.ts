import dotenv from "dotenv";

import {
  T3nClient,
  createEthAuthInput,
  eth_get_address,
  loadWasmComponent,
  metamask_sign,
  setEnvironment,
} from "@terminal3/t3n-sdk";

dotenv.config({
  quiet: true,
});

const apiKey =
  process.env.T3N_API_KEY?.trim();

if (!apiKey) {
  throw new Error(
    "T3N_API_KEY is not configured",
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

    /*
     * Sandbox only.
     * Do not use this as a production
     * trust configuration.
     */
    trustAnchor: {
      unsafe_trust_server: true,
    },

    handlers: {
      EthSign:
        metamask_sign(
          address,
          undefined,
          apiKey,
        ),
    },
  });

await client.handshake();

const did =
  await client.authenticate(
    createEthAuthInput(
      address,
    ),
  );

const organisationName =
  process.env
    .T3N_ORG_NAME ||
  "Solana Treasury Guard";

console.log(
  `Authenticated as: ${did}`,
);

console.log(
  `Creating organisation: ${organisationName}`,
);

const organisationDid =
  await client.createOrganisation(
    organisationName,
  );

console.log(
  JSON.stringify(
    {
      success: true,
      environment,
      organisationName,
      organisationDid,
    },
    null,
    2,
  ),
);
