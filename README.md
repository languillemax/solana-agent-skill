# Solana Agent Skill Toolkit

Security-hardened Solana action toolkit for autonomous agents, written in TypeScript and usable through an Express REST API, ElizaOS integration, and an authenticated Terminal 3 Network (T3N) policy guard.

The project separates:

- input validation,
- risk policy,
- transaction simulation,
- signing,
- broadcasting,
- and simulation-only protocol previews.

This distinction is intentional: the repository does **not** claim that every protocol adapter currently performs a live on-chain execution.

---

## Architecture

```text
Agent / HTTP Client
        |
        v
   Zod validation
        |
        v
    Risk policy
        |
        v
Authenticated T3N policy
        |
        +------------------------------+
        |                              |
        v                              v
Real transaction path          Preview-only adapter
        |                              |
        v                              v
Build transaction             executionMode="simulation"
        |
        v
Solana RPC simulation
        |
    approved?
    /      \
  NO        YES
  |          |
 abort       v
           sign
             |
             v
          broadcast
Security invariant

For supported real transaction paths:
simulation -> approval -> signature -> broadcast
Signing is not performed when RPC simulation fails.
Current Execution Matrix
Module	Current behavior	On-chain broadcast
Pump.fun trade	Real transaction path with RPC simulation before signing	Yes
Jupiter swap	Real transaction path with RPC simulation before signing	Yes
SOL transfer	Real transaction path with RPC simulation before signing	Yes
SPL transfer	Real transaction path with RPC simulation before signing	Yes
Lending / Kamino / Marginfi	Explicit preview adapter	No
Perps	Explicit preview adapter	No
Squads	Explicit preview adapter	No
Token-2022 module	Explicit preview adapter	No
T3N solana-guard	Live authenticated policy enforcement	Authorizes SOL transfer, Jupiter swap and Pump.fun before signing

Preview adapters return:
{
  "success": true,
  "executionMode": "simulation",
  "simulationId": "..."
}
They deliberately do not return fake Solana transaction signatures.

Security Controls
Strict input validation

Zod schemas constrain:

positive amounts,
leverage,
slippage,
supported enums,
input shapes,
unexpected HTTP properties.

Execution endpoint schemas use strict parsing, so client-supplied fields such as:
privateKey
rpcUrl
are rejected.

Central risk engine

Local default policy:
max amount:      10 SOL
max leverage:    10x
max slippage:    500 bps / 5%

Live T3N `solana-guard` policy:
max amount:      5 SOL
max slippage:    100 bps
Signer isolation

The HTTP API never accepts a private key in a request body.

The signer is loaded server-side from:
AGENT_PRIVATE_KEY
If no signer is configured, execution runs in read-only mode.

Server-controlled RPC

Clients cannot provide an execution RPC URL.

The server uses:
SOLANA_RPC_URL
or the default Solana mainnet RPC endpoint.

HTTP execution authentication

State-changing execution endpoints require:
Authorization: Bearer <SOLANA_AGENT_API_KEY>
If SOLANA_AGENT_API_KEY is absent, HTTP execution is disabled by default.

RPC simulation gate

Built Solana transactions in supported execution paths are simulated using the RPC before signing.

A failed simulation aborts the execution path before any signature is produced.
REST API

Start the server:
npm run build
npm start
Development:
npm run dev
Health
curl http://localhost:3000/health
Read-only examples

Pump.fun token info:
curl \
  http://localhost:3000/api/pumpfun/info/<MINT>
Lending rates:
curl \
  "http://localhost:3000/api/lending/rates?protocol=kamino"
Perps market preview data:
curl \
  http://localhost:3000/api/perps/market/SOL-PERP
Authenticated Pump.fun execution
curl -X POST \
  http://localhost:3000/api/pumpfun/trade \
  -H "Authorization: Bearer $SOLANA_AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mint": "So11111111111111111111111111111111111111112",
    "action": "buy",
    "amount": 0.1,
    "denominatedInSol": true,
    "slippageBps": 100
  }'
Preview-only lending action
curl -X POST \
  http://localhost:3000/api/lending/action \
  -H "Authorization: Bearer $SOLANA_AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "protocol": "kamino",
    "asset": "USDC",
    "amount": 1,
    "action": "deposit"
  }'
This endpoint currently returns a simulation/preview result and does not submit a Kamino or Marginfi transaction.

Environment

Copy the example configuration:
cp .env.example .env
Required for authenticated execution:
SOLANA_AGENT_API_KEY
AGENT_PRIVATE_KEY
Optional:
SOLANA_RPC_URL
JUPITER_API_URL
PORT

Terminal 3 integration:
T3N_ENV
T3N_API_KEY
T3N_ORG_DID

Never commit .env or private key material.

Automated Tests

Run:
npm test
Current validated suite:
42 tests
42 pass
0 fail
Coverage includes:

Zod validation,
risk limits,
simulation failure behavior,
HTTP API authentication,
private-key injection rejection,
RPC URL injection rejection,
read-only execution mode,
Pump.fun safety checks,
protocol preview contracts,
ElizaOS registration,
T3N authentication, delegation checks and live `solana-guard` policy enforcement,
webhook parsing,
lending/perps/Squads/Token-2022 constraints.

Important: passing tests do not imply that every protocol module performs live mainnet execution. Preview-only modules are identified explicitly above.

Development
npm install
npm test
npm run build
Release-oriented checks:
npm test
npm run build
npm pack --dry-run
git diff --check

Dependency Security

npm audit may report vulnerabilities inherited from the Solana JavaScript dependency tree.

Do not use:
npm audit fix --force
without reviewing the resulting dependency changes. Forced remediation may select incompatible or severely outdated Solana packages.

See SECURITY.md for the current threat model and limitations.

License

MIT
