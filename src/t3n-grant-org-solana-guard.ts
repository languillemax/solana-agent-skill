import dotenv from "dotenv";
import { getT3nLiveStatus } from "./t3n-live.js";
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

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.t3n-agent.local", override: true, quiet: true });

const apiKey = process.env.T3N_API_KEY?.trim();
const orgDid = process.env.T3N_ORG_DID?.trim();
const agentDid = process.env.T3N_AGENT_DID?.trim();

if (!apiKey || !orgDid || !agentDid) {
  throw new Error("Missing T3N env");
}

setEnvironment("sandbox");

const contractId =
  `z:${orgDid.replace(/^did:t3n:/, "")}:solana-guard`;

const wasm = await loadWasmComponent();
const address = eth_get_address(apiKey);

const client = new T3nClient({
  wasmComponent: wasm,
  trustAnchor: { unsafe_trust_server: true },
  handlers: {
    EthSign: metamask_sign(address, undefined, apiKey),
  },
});

await client.handshake();
await client.authenticate(createEthAuthInput(address));

const orgData =
  createOrgDataClientFromSession(client, getNodeUrl());

const delegator = await getT3nLiveStatus();

if (!delegator.authenticated || !delegator.did) {
  throw new Error("Unable to resolve delegator DID");
}

const grant: BoundGrant = {
  grantee: delegator.did,
  contract_id: contractId,
  functions: ["authorize-solana-action"],
  scopes: ["solana-guard/invoke"],
};

const result =
  await orgData.addDelegationGrants({
    orgDid,
    grants: [grant],
  });

console.log(JSON.stringify({ success: true, result }, null, 2));
