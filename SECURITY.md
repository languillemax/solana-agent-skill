
Security Policy & Threat Model
Scope

This document describes the security properties currently implemented by the repository.

It intentionally distinguishes real transaction execution from preview-only adapters.

1. Untrusted Agent / HTTP Input
Risk

An LLM or external client may generate:

negative amounts,
excessive amounts,
excessive leverage,
excessive slippage,
malformed values,
unexpected properties,
attacker-controlled execution configuration.
Mitigation

The project uses Zod schemas and a centralized risk engine before execution.

HTTP execution payloads use strict schemas where applicable.

Client-provided execution configuration such as:
privateKey
rpcUrl
is rejected rather than trusted.

2. Transaction Simulation Gate
Risk

A transaction could fail because of:

invalid instructions,
invalid account state,
insufficient funds,
program errors,
other RPC-detectable execution failures.

Signing a transaction before checking these conditions unnecessarily exposes an execution path to avoidable failures.

Mitigation

Supported real transaction flows follow:
build
  |
  v
RPC simulateTransaction()
  |
approved?
 /     \
no      yes
|        |
abort    sign
          |
          v
       broadcast
Current transaction paths using the RPC simulation-before-sign invariant include:

Pump.fun trading,
Jupiter swaps,
SOL transfers,
SPL transfers.

A failed simulation prevents the subsequent signing step in these flows.

Limitation

The T3N adapter's logical/policy simulation is not the same thing as Solana RPC transaction simulation.

Similarly, preview-only lending, perps, Squads and Token-2022 adapters do not build or broadcast transactions and therefore do not claim RPC transaction simulation.

3. Key Management
Risk

Private keys may be:

exposed in source code,
transmitted through HTTP,
accidentally logged,
generated unexpectedly at runtime.
Mitigation

Execution keys are loaded only from:

AGENT_PRIVATE_KEY
The REST API does not accept a private key in request payloads.

The server does not generate a replacement wallet when the signer is absent.

Without AGENT_PRIVATE_KEY, execution operates in read-only mode and authenticated execution requests fail closed.

Operational requirement

Never commit:
.env
private-key files
seed phrases
secret key arrays
Use a dedicated low-balance execution wallet when testing live transaction paths.

4. HTTP Authentication
Risk

A publicly reachable server could expose transaction execution endpoints to unauthorized users.

Mitigation

Execution endpoints require:
Authorization: Bearer <SOLANA_AGENT_API_KEY>
If SOLANA_AGENT_API_KEY is not configured, HTTP execution is disabled.

Token comparison uses constant-time comparison for equal-length values.

Read-only informational endpoints do not require the execution API key.

5. RPC Trust Boundary
Risk

Allowing a request to choose its RPC endpoint could permit attacker-controlled infrastructure to influence execution behavior.

Mitigation

The REST API does not accept client-provided RPC URLs for execution.

RPC configuration is controlled server-side with:
SOLANA_RPC_URL
6. Risk Limits

Default centralized limits:
Maximum amount:    10 SOL
Maximum leverage:  10x
Maximum slippage:  500 bps / 5%
Inputs must also be finite and satisfy positive/non-negative constraints depending on the field.

These limits are safety defaults, not financial advice and not a guarantee against economic loss.

7. Preview-Only Protocol Adapters

The following modules are currently explicit simulation/preview adapters:

lending,
perps,
Squads,
Token-2022 module.

They return:
executionMode: "simulation"
simulationId: "..."
They do not return fake blockchain signatures.

A simulationId must not be interpreted as a Solana transaction signature.

8. Dependency Vulnerabilities

The project depends on the Solana JavaScript ecosystem.

npm audit may report vulnerabilities in transitive dependencies.

Some automated forced fixes can replace current Solana packages with incompatible or extremely old versions. Therefore:
npm audit fix --force
must not be run blindly.

Dependency findings should instead be:

reviewed individually,
matched against upstream fixes,
upgraded through compatible releases,
retested with the complete test suite.
9. Reporting a Vulnerability

Do not publish private keys, seed phrases or other credentials in a GitHub issue.

Provide:

affected component,
reproduction steps,
expected behavior,
actual behavior,
impact,
suggested mitigation if known.

Do not include live secrets in the report.
