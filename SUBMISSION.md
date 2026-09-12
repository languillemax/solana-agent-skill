
Superteam Submission — Solana Agent Skill Kit

Repository: https://github.com/languillemax/solana-agent-skill
Author: languillemax
Status: Security-hardened reference implementation

Executive Summary

solana-agent-skill is a TypeScript toolkit for connecting autonomous agents to Solana actions through explicit validation, risk controls and execution boundaries.

The project focuses on a central problem in autonomous on-chain agents:

an agent-generated action must not be trusted merely because it is syntactically valid.

The toolkit therefore separates:
agent intent
-> Zod validation
-> risk policy
-> transaction construction
-> RPC simulation
-> signing
-> broadcast
For supported real transaction paths, simulation must pass before signing becomes reachable.

Modules that are not yet implemented as live protocol integrations are explicitly marked as simulation-only rather than returning fake transaction signatures.

Security Architecture
1. Strict schema validation

Zod validates agent and HTTP parameters before execution.

Invalid amounts, excessive leverage, excessive slippage and malformed payloads are rejected.

2. Central risk engine

Default policy includes:
max amount:     10 SOL
max leverage:   10x
max slippage:   500 bps / 5%
3. Simulation-before-sign

Real transaction paths for Pump.fun, Jupiter swaps and SOL/SPL transfers apply the invariant:
RPC simulation
     |
     v
 approved?
 /       \
NO        YES
|          |
abort      sign
            |
            v
         broadcast
This prevents those execution paths from signing a transaction after a failed simulation.

4. Server-side signer isolation

Private keys are never accepted from HTTP request bodies.

The signer is loaded from:
AGENT_PRIVATE_KEY
No fallback Keypair.generate() execution wallet is created.

5. Server-controlled RPC

Execution requests cannot provide their own rpcUrl.

The RPC endpoint is controlled through:
SOLANA_RPC_URL
6. Authenticated HTTP execution

Execution endpoints require a Bearer API key configured through:
SOLANA_AGENT_API_KEY
Without it, execution is disabled by default.

Execution Matrix
Capability	Mode
Pump.fun trading	Real transaction execution
Jupiter swap	Real transaction execution
SOL transfer	Real transaction execution
SPL transfer	Real transaction execution
Lending	Simulation / preview
Perps	Simulation / preview
Squads	Simulation / preview
Token-2022 adapter	Simulation / preview
ElizaOS integration	Agent integration surface
T3N adapter	Policy / logical guardrail surface

Preview-only modules return explicit executionMode: "simulation" metadata and do not manufacture blockchain transaction signatures.

Automated Verification

Current suite:
35 tests
35 pass
0 fail
The suite verifies, among other properties:

strict Zod validation,
negative amount rejection,
leverage limits,
simulation gate failure behavior,
HTTP execution disabled without an API key,
rejection of invalid Bearer tokens,
rejection of client-provided privateKey,
rejection of client-provided rpcUrl,
read-only behavior without a configured signer,
explicit simulation contracts for non-live modules,
absence of fake signatures in preview adapters,
ElizaOS action registration,
T3N guardrails.

Run:
npm test
Why This Matters for Autonomous Agents

Traditional wallet applications assume a human is reviewing transaction intent.

An autonomous agent changes that threat model.

The model itself may generate:

unsafe values,
malformed values,
excessive leverage,
incorrect protocol parameters,
unintended actions.

solana-agent-skill inserts deterministic software controls between model output and the signing boundary.

The primary design goal is therefore not simply:
"Can the agent create a transaction?"
but:
"Can an unsafe transaction reach the signer?"
For implemented real transaction paths, failed RPC simulation blocks signing.

Transparency / Current Limitations

This repository intentionally does not claim production-complete protocol execution for every module.

Current preview-only adapters include:

Kamino / Marginfi lending execution,
perps execution,
Squads transaction execution,
Token-2022 transaction execution.

These modules demonstrate validation and agent-integration contracts while clearly identifying their simulation status.

The repository also inherits transitive packages from the Solana JavaScript ecosystem that may appear in npm audit. Forced dependency downgrades are not used as a substitute for compatible remediation.

Verification Commands
npm install
npm test
npm run build
npm pack --dry-run
git diff --check
npm audit --omit=dev
Expected test baseline:
35 pass
0 fail
