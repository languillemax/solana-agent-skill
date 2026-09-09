# Solana Agent Skill (v1.1.0) ![CI Test Suite](https://github.com/languillemax/solana-agent-skill/actions/workflows/test.yml/badge.svg)

> Industrial-grade, modular Solana execution skill & REST microservice for AI Agents (ElizaOS, LangChain, AutoGen, Vercel AI SDK).

## Key Features
- **Jupiter v6 Swap Integration**: Automated route evaluation & token swapping.
- **Jito Liquid Staking**: One-click JitoSOL staking quote and transaction prep.
- **Real-Time Portfolio & Pricing**: Balances + Jupiter Price API v2 USD valuation.
- **Native ElizaOS Plugin**: Out-of-the-box `solanaAgentPlugin` integration.
- **LLM Function Calling Specs**: Pre-formatted JSON schemas for OpenAI, Ollama, and Anthropic.
- **REST API Microservice**: Endpoint support (`/tools`, `/portfolio`, `/stake/jito`) for non-JS agents.

## Verification & Testing
```bash
npm install
npm run build
npm test
npx tsx demo.ts
REST API Server
npx tsx -e 'import { startServer } from "./src/index.js"; startServer();'
