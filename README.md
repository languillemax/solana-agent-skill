# ⚡ Solana Agent Skill Kit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-Web3-purple.svg)](https://solana.com/)

An autonomous AI Agent toolkit designed to perform automated, production-ready on-chain transactions on Solana (Jupiter V6 Swaps, Native SOL & SPL Token Transfers, and Event Monitoring).

## 🧰 Architecture

- **`SolanaAgent`** : Core agent managing RPC connection and wallet signatures.
- **`Jupiter Swap Module`** : Direct routing via Jupiter V6 Swap API for optimal slippage.
- **`Token Transfer Module`** : SPL-Token and SOL transfer pipeline with ATA (Associated Token Account) resolution.

## 🚀 Quick Start

### 1. Installation
```bash
git clone [https://github.com/languillemax/solana-agent-skill.git](https://github.com/languillemax/solana-agent-skill.git)
cd solana-agent-skill
npm install
2. Configuration

Copy .env.example to .env and insert your RPC URL or Keypair JSON array:
SOLANA_RPC_URL=[https://api.mainnet-beta.solana.com](https://api.mainnet-beta.solana.com)
AGENT_PRIVATE_KEY=[12,34,56,...]
3. Run Tests
npm run test
4. Build & Run
npm run build
npm run start
🐳 Docker Support
docker build -t solana-agent-skill .
docker run --env-file .env solana-agent-skill
📜 License

MIT © languillemax
