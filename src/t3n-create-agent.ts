import dotenv from "dotenv";
import {
  existsSync,
  writeFileSync,
  chmodSync,
} from "node:fs";
import {
  resolve,
} from "node:path";

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

const organisationDid =
  process.env.T3N_ORG_DID?.trim();

if (!apiKey) {
  throw new Error(
    "T3N_API_KEY is not configured",
  );
}

if (!organisationDid) {
  throw new Error(
    "T3N_ORG_DID is not configured",
  );
}

const secretPath =
  resolve(
    ".env.t3n-agent.local",
  );

/*
 * Safety guard:
 * do not accidentally create
 * multiple agents by rerunning.
 */
if (existsSync(secretPath)) {
  throw new Error(
    `${secretPath} already exists. Refusing to create another agent.`,
  );
}

const environment =
  process.env.T3N_ENV ===
  "production"
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
      unsafe_trust_server:
        true,
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

await client.authenticate(
  createEthAuthInput(
    address,
  ),
);

const agentName =
  process.env.T3N_AGENT_NAME ||
  "Solana Treasury Guard Agent";

console.log(
  `Creating T3N agent: ${agentName}`,
);

const result =
  await client.createAgent(
    organisationDid,
    agentName,
  );

const agentDid =
  typeof result.agentDid ===
  "string"
    ? result.agentDid
    : (
        result.agentDid as unknown as {
          value: string;
        }
      ).value;

const contents = [
  "# Generated T3N agent credentials",
  "# DO NOT COMMIT THIS FILE",
  `T3N_AGENT_DID=${agentDid}`,
  `T3N_AGENT_API_KEY=${result.apiKey}`,
  `T3N_AGENT_KEY_ID=${result.keyId}`,
  `T3N_ORG_DID=${organisationDid}`,
  "",
].join("\n");

writeFileSync(
  secretPath,
  contents,
  {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  },
);

chmodSync(
  secretPath,
  0o600,
);

console.log(
  JSON.stringify(
    {
      success: true,
      environment,
      agentName,
      agentDid,
      keyId:
        result.keyId,
      credentialFile:
        ".env.t3n-agent.local",
      cardEntryId:
        result.cardEntryId,
    },
    null,
    2,
  ),
);

console.log(
  "\nAgent API key saved locally and NOT printed.",
);
