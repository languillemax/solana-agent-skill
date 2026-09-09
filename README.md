# Solana Agent Skill Toolkit

Infrastructure d'action et toolkit Node.js / TypeScript (Node 22) open-source prêt pour **ElizaOS** et serveurs **Express REST API**.

Il fournit une couche d'abstraction standardisée permettant à un agent autonome de déclencher des opérations Solana complexes de manière programmable.

## 🏗️ Architecture System

```mermaid
graph TD
    User([Utilisateur / Prompt]) --> Agent[ElizaOS Agent / Client HTTP]
    Agent -->|Validation Zod & Intent| Skill[Solana Agent Skill Toolkit]
    Skill -->|Execution Layer| Express[Serveur Express REST]
    Skill -->|Plugin Contract| Eliza[Plugin ElizaOS]
    Express & Eliza -->|Web3.js / Anchor| Protocols
    subgraph Protocols[Écosystème Solana]
        Jupiter[Jupiter v6 / Perps]
        Drift[Drift Protocol]
        Kamino[Kamino / Marginfi]
        Squads[Squads Multisig v4]
        Pump[Pump.fun / Raydium]
        Token[Token-2022 / cNFTs]
    end
    Express & Eliza -->|RPC & Webhooks| RPC[Helius / QuickNode RPC]
```

## 🛡️ Security & Risk Controls

Mécanismes de validation et de contrôle d'exécution visant à réduire les risques d'instructions invalides ou de paramètres hors-bornes avant soumission de transaction :
- **Strict Schema Validation (Zod)** : Chaque paramètre généré par un LLM est filtré par un schéma strict avant la construction de la transaction.
- **Contrôle des Bornes & Slippage** : Protections contre les valeurs négatives, aberrantes ou un glissement excessif.
- **Gestion Isolée des Clés** : Utilisation exclusive des variables d'environnement pour la signature, aucune clé stockée en dur.
- **Gestion des Erreurs RPC** : Interception globale des échecs de diffusion et transmission de messages d'erreur explicites à l'agent.

## 🧪 13 Critical-Path Scenarios & Test Suite

La suite de tests (`npm test`) couvre **13 scénarios critiques** en précisant la nature exacte de chaque vérification :

| Scénario / Module | Nature du Test | Portée du Test | Statut |
| :--- | :--- | :--- | :---: |
| **Core & Function Calling** | Unitaire (Schema Zod) | Validation stricte des spécifications AI | Validé |
| **ElizaOS Plugin** | Contrat Structurel | Enregistrement des actions et handlers ElizaOS | Validé |
| **v1.1 Base & Staking** | Live API / Simulated RPC | API Jupiter Price v2 & simulation Staking Jito | Validé |
| **API REST Microservice** | E2E Integration | Serveur HTTP réel Express & endpoints REST | Validé |
| **M1 : Launchpad & DEX** | Live HTTP API | Métadonnées Pump.fun API & spec Raydium AMM | Validé |
| **M2 : Money Markets** | Simulation / Calculator | Calculateur de taux Kamino/Marginfi & emprunt | Validé |
| **M3 : Perps & Levier** | Contract Simulation | Paramètres Drift / Jupiter Perps & levier | Validé |
| **M4 : Multisig & Blinks** | Logic & URL Spec | Création Squads v4 & liens Dialect Blinks | Validé |
| **M5 : Signals & Webhooks**| Fixture Replay | Traitement des payloads d'événements Helius | Validé |
| **M6 : Advanced Assets** | Logic / Spec Test | Extensions Token-2022 (Transfer Tax) & cNFTs | Validé |

## 🔌 Structure d'une Action ElizaOS (Plugin Contract)

Exemple concret du contrat d'interface exposant une action au moteur ElizaOS :

```typescript
import { Action, AgentRuntime, Memory, State } from "@elizaos/core";
import { pumpfunBuySchema } from "./tools.js";

export const pumpfunBuyAction: Action = {
  name: "PUMPFUN_BUY",
  description: "Acheter des tokens sur Pump.fun via Solana Agent Skill",
  simulated: true,
  validate: async (runtime: AgentRuntime, message: Memory) => {
    return true; // Validation du contexte agent
  },
  handler: async (runtime: AgentRuntime, message: Memory, state?: State) => {
    // 1. Extraction et validation Zod
    const params = pumpfunBuySchema.parse(message.content);
    // 2. Exécution via la couche d'action Solana
    return { success: true, action: "PUMPFUN_BUY", params };
  },
  examples: []
};
```

## 🌐 Endpoints REST API — Exemples d'Appels Microservice

Démarrage du serveur REST :
```bash
npm start
```

### Module 1 : Launchpad & DEX (Pump.fun)
```bash
curl -X POST http://localhost:3000/api/solana/pumpfun/buy \
  -H "Content-Type: application/json" \
  -d '{"mint": "2zMMhcB612z73mB52v6dGdb655752t22", "amountSol": 0.05, "slippage": 1}'
```

### Module 2 : Money Markets (Kamino / Marginfi)
```bash
curl -X POST http://localhost:3000/api/solana/lending/deposit \
  -H "Content-Type: application/json" \
  -d '{"protocol": "kamino", "asset": "USDC", "amount": 50}'
```

### Module 3 : Perps & Levier (Drift / Jupiter Perps)
```bash
curl -X POST http://localhost:3000/api/solana/perps/open \
  -H "Content-Type: application/json" \
  -d '{"market": "SOL-PERP", "side": "long", "amount": 1, "leverage": 2}'
```

### Module 4 : Multisig Squads v4
```bash
curl -X POST http://localhost:3000/api/solana/squads/create \
  -H "Content-Type: application/json" \
  -d '{"threshold": 2, "members": ["83bd3y4...", "5Q544f..."]}'
```

### Module 5 : Signals & Webhooks (Helius)
```bash
curl -X POST http://localhost:3000/api/solana/webhook/helius \
  -H "Content-Type: application/json" \
  -d '{"type": "TRANSFER", "signature": "5Kn...", "accountData": []}'
```

### Module 6 : Token-2022 Extensions
```bash
curl -X POST http://localhost:3000/api/solana/token2022/transfer \
  -H "Content-Type: application/json" \
  -d '{"mint": "4k3Dyj...", "destination": "83bd3y4...", "amount": 100, "fee": 1}'
```

## 🤖 Exemple de Flux d'Exécution Agent (Conceptuel)

*(Schéma explicatif du traitement d'une requête par l'agent)*

```
User Prompt: "Achète pour 0.05 SOL du token Pump.fun <MINT_ADDRESS>"
├── 1. Intent Detection -> Match Action: "PUMPFUN_BUY"
├── 2. Zod Schema Validation -> Params: { mint: "<MINT_ADDRESS>", amountSol: 0.05 }
├── 3. Tool Execution -> Construction de l'instruction Solana Web3.js
├── 4. Simulation & Signature -> Signature via la Keypair de l'agent
└── 5. Result -> Output JSON: { success: true, status: "executed" }
```

## 🧪 Lancer la Batterie de Tests

```bash
npm test
```
