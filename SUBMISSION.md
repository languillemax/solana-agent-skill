# Kit de Soumission — Superteam Earn Bounty

## 🚀 Projet
**Solana Agent Skill Toolkit**

## 📌 Description
Toolkit Node.js / TypeScript open-source (v1.1.0 + 6 Modules) permettant aux agents autonomes (ElizaOS, bots, APIs HTTP) d'interagir avec l'écosystème Solana DeFi et Web3.

## ✅ Checklist de Livraison
- [x] **Base v1.1.0** : Transfers SOL/SPL, Jupiter Swap v6, Staking Jito, Portfolio
- [x] **Module 1** : Launchpad Pump.fun & AMM Raydium
- [x] **Module 2** : Money Markets (Kamino & Marginfi Deposit/Borrow)
- [x] **Module 3** : Perps & Levier (Drift Protocol & Jupiter Perps)
- [x] **Module 4** : Multisig Squads v4 & Solana Blinks (Dialect)
- [x] **Module 5** : Signals & Webhooks (Helius & QuickNode)
- [x] **Module 6** : Advanced Assets (Token-2022 Extensions & Metaplex cNFTs)
- [x] **Couverture de Tests** : 13/13 tests validés (`npm test`)
- [x] **Intégrations Duales** : Serveur Express REST + Plugin ElizaOS
- [x] **CI/CD** : GitHub Actions Workflow (`.github/workflows/test.yml`)
- [x] **Documentation** : README.md de production avec diagramme Mermaid et cURL

## 🧪 Quickstart & Vérification
1. `npm install && npm run build`
2. `npm test` (13/13 validés)
3. `npm start` (REST API sur port 3000)
4. `npx tsx examples/eliza_agent.ts` (Intégration ElizaOS)
