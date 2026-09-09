# 🚀 Superteam Earn Bounty Submission: Solana Agent Skill Toolkit

## 📌 Project Overview
**Solana Agent Skill Toolkit** est une infrastructure d'actions *on-chain* pour agents autonomes sur Solana, développée en **Node.js / TypeScript (Node 22)**. Elle fait office de couche d'abstraction standardisée entre l'intention d'un agent LLM et l'exécution sur la blockchain Solana.

- **Repository GitHub** : [https://github.com/languillemax/solana-agent-skill](https://github.com/languillemax/solana-agent-skill)
- **Surface d'Intégration** : Bi-fonctionnelle (**Plugin ElizaOS** & **API REST Express**)
- **Validation & Sécurité** : Filtrage strict Zod, limites de risque paramétrables et porte de simulation (*Simulation Gate*).

---

## 🏗️ Architecture & Flow Agent
USER / PROMPT
               │
               ▼
          AGENT / LLM
               │
               ▼
     INTENT & PARSING (Zod)
               │
               ▼
       RISK CONTROLS (Limits)
               │
               ▼
     SIMULATION GATE (RPC)
        ┌──────┴──────┐
      FAIL           PASS
        │             │
      ABORT         SIGN & BROADCAST
                      │
                      ▼
              STRUCTURED RESULT
---

## 📦 Scope des 6 Modules Protocolaires

1. **Module 1 : Launchpad & DEX** — Pump.fun (Buy/Sell/Metadata) & Raydium Swap
2. **Module 2 : Money Markets** — Kamino & Marginfi (Deposit, Borrow, Yield Rates)
3. **Module 3 : Perps & Levier** — Drift Protocol & Jupiter Perps (Position opening, leverage checks)
4. **Module 4 : Governance & Blinks** — Squads Multisig v4 & Génération de liens Solana Blinks
5. **Module 5 : Signals & Webhooks** — Parsing & traitement automatisé des webhooks Helius/QuickNode
6. **Module 6 : Advanced Token Extensions** — Token-2022 (Transfer Tax, Interest-bearing) & Metaplex cNFTs

---

## 🧪 Matrice de Preuve & Batterie de Tests (22 Scénarios)

La suite de tests (`npm test`) exécute **22 scénarios** (10 *Happy Paths* + 12 Tests Négatifs de Sécurité) répartis sur 10 domaines fonctionnels avec **100 % de réussite** :

| Domaine Fonctionnel | Fichier de Test | Scénarios Validés | Périmètre Vérifié |
| :--- | :--- | :---: | :--- |
| **Core Specs & Risk** | `tests/core.test.ts` | 3 | Schemas Zod, rejets montants négatifs, levier > 10x |
| **ElizaOS Plugin** | `tests/eliza.test.ts` | 2 | Contrats d'actions & gestion des erreurs d'exécution |
| **Base v1.1 & Gate** | `tests/base.test.ts` | 3 | Staking Jito, API Jupiter Price v2 & arrêt sur échec simulation |
| **API REST Express** | `tests/api.test.ts` | 2 | Routage des endpoints & réponses 400 structurées |
| **M1 : Launchpad & DEX** | `tests/module1-pumpfun.test.ts` | 2 | Métadonnées Pump.fun & rejet slippage abusif (>50%) |
| **M2 : Money Markets** | `tests/module2-lending.test.ts` | 2 | Consultation de taux & rejet emprunt négatif |
| **M3 : Perps & Levier** | `tests/module3-perps.test.ts` | 2 | Ouverture de position & rejet de levier hors-bornes |
| **M4 : Multisig & Blinks** | `tests/module4-squads.test.ts` | 2 | Création Squads v4 & rejet seuil > membres |
| **M5 : Signals & Webhooks** | `tests/module5-webhooks.test.ts` | 2 | Traitement Helius & rejet de payloads corrompus |
| **M6 : Advanced Assets** | `tests/module6-token2022.test.ts` | 2 | Calcul de taxe Token-2022 & rejet destination vide |

---

## 🔍 Reproduire la Vérification

```bash
git clone [https://github.com/languillemax/solana-agent-skill.git](https://github.com/languillemax/solana-agent-skill.git)
cd solana-agent-skill
npm install
npm test
Résultat attendu : 22 passing (0 failing).
