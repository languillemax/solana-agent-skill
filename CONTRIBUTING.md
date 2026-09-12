
Contributing to Solana Agent Skill Toolkit
Quick Start
npm install
npm test
npm run build
Adding a New Action
Define strict input validation with Zod.
Apply centralized risk limits where financial parameters are involved.
Separate transaction construction from signing.
For real transaction execution, perform RPC simulation before signing.
Abort without signing when simulation fails.
Add at least one happy-path test and one negative/security test.
Document whether the integration is:
real on-chain execution, or
simulation/preview only.
Simulation-Only Modules

A preview adapter must clearly return:
executionMode: "simulation"
It must not manufacture a value that looks like a blockchain transaction signature.

Secrets

Never commit:
.env
private keys
seed phrases
API keys
HTTP APIs must not accept private execution keys from request bodies.

Before Opening a PR

Run:
npm test
npm run build
git diff --check
