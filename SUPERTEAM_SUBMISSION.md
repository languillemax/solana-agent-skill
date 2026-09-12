# Solana Treasury Guard — T3N-secured autonomous treasury agent

## Project

Repository: https://github.com/languillemax/solana-agent-skill

Solana Treasury Guard is a security layer for autonomous Solana agents.

Execution pipeline:

Agent intent → Zod validation → local risk engine → authenticated T3N policy → transaction construction → Solana RPC simulation → signing → broadcast.

## Terminal 3 Integration

A custom Terminal 3 contract, `solana-guard`, provides live policy enforcement for:

- SOL transfers
- SOL/wSOL Jupiter swaps
- SOL-denominated Pump.fun trades

Policy:

- Maximum amount: 5 SOL
- Maximum slippage: 100 bps
- Unsupported or denied actions fail closed

The T3N agent has both required delegation layers:

- `member_delegation`: satisfied
- `org_delegation`: satisfied
- final delegation verdict: `authorised: true`
- `missing: []`

## Security Properties

- T3N authorization occurs before signing
- Solana RPC simulation must pass before signing
- HTTP clients cannot submit private keys
- HTTP clients cannot override the execution RPC
- execution API requires Bearer authentication
- missing signer configuration results in read-only behavior
- preview-only integrations never return fake transaction signatures

## Verification

Automated test suite:

- 42 tests
- 42 pass
- 0 fail

Live T3N policy test:

```json
{"authorized":true,"action":"SOL_TRANSFER","reason":null,"max_amount_sol":5.0,"max_slippage_bps":100}
```

### Negative policy test:

- 6 SOL → denied
- reason: `amount_exceeds_limit`

Delegation verification:

- member delegation satisfied
- organisation delegation satisfied
- `authorised: true`
- `missing: []`
## Bugs / Issues Encountered
### Agent execution credits

The provisioned T3N agent API-key identity currently has zero sandbox execution credits.

Direct /api/invoke therefore returns:

InsufficientCredit

This is not a delegation failure: the independent delegation check resolves successfully.

The same deployed solana-guard contract was successfully executed through the authenticated T3N session.

### Delegation setup

The first organisation grant targeted the agent DID directly. T3N delegation checking showed the missing grant was the organisation grant associated with the delegated member (pii_did).

After assigning the organisation grant to the member DID:

member_delegation satisfied
org_delegation satisfied
final result authorised: true
## Screenshots

Insert screenshots showing:

1. `npm test` → 42 pass / 0 fail
2. T3N policy authorization → `authorized: true`
3. T3N delegation check → `authorised: true`, `missing: []`
4. GitHub repository / relevant T3N contract source
## Operation / Handover

I am willing to continue operating and developing the agent after the bounty.

The architecture can also be handed over to Terminal 3, including the custom contract source, deployment tooling, organisation/agent provisioning scripts, and delegation setup.

## Reproduction

```bash
npm install
npm test
npm run t3n:smoke
npm run t3n:authorize-smoke
npm run t3n:delegation-check
```
