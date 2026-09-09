# 🚀 Superteam Earn Bounty Submission: Solana Agent Skill Toolkit

## 📌 Project Overview
**Solana Agent Skill Toolkit** est une infrastructure d'actions *on-chain* pour agents autonomes sur Solana, développée en **Node.js / TypeScript (Node 22)**. Elle agit comme une couche d'abstraction sécurisée et standardisée entre l'intention d'un LLM et la blockchain Solana.

- **Repository GitHub** : [https://github.com/languillemax/solana-agent-skill](https://github.com/languillemax/solana-agent-skill)
- **Surface d'Intégration** : Bi-fonctionnelle (**Plugin ElizaOS** & **API REST Express**)
- **Architecture de Sécurité** : Filtrage strict Zod, limites de risque paramétrables et porte de simulation (*Simulation Gate*).

---

## 🛡️ Agent Safety Execution Flow

```
             LLM / AGENT INTENT
                     │
                     ▼
             ZOD PARSING & VALIDATION
                     │
                     ▼
             RISK LIMITS CHECK
                     │
                     ▼
           TRANSACTION CONSTRUCTION
                     │
                     ▼
           RPC SIMULATION GATE
            ┌────────┴────────┐
          FAIL              PASS
            │                 │
          ABORT             SIGN & BROADCAST
                              │
                              ▼
                      STRUCTURED RESULT
```

---

## 🧪 Evidence Matrix — 22 Test Scenarios

La suite de tests automatisée (`npm test`) exécute **22 scénarios** (10 *Happy Paths* + 12 Tests Négatifs de Sécurité) avec **100 % de réussite** et **0 erreur TypeScript** (`npx tsc --noEmit`) :

| Domaine Fonctionnel | Fichier de Test | Scénarios Validés | Périmètre & Preuve |
| :--- | :--- | :---: | :--- |
| **Core Validation & Risk** | `tests/core.test.ts` | 3 | Schémas Zod stricts, rejet montants négatifs & levier > 10x |
| **ElizaOS Plugin** | `tests/eliza.test.ts` | 2 | Enregistrement d'actions & gestion des erreurs d'exécution |
| **Base Solana & Simulation** | `tests/base.test.ts` | 3 | Staking Jito, API Jupiter Price & arrêt sur échec simulation |
| **API REST Express** | `tests/api.test.ts` | 2 | Routage des endpoints & réponses 400 structurées |
| **M1 : Launchpad & DEX** | `tests/module1-pumpfun.test.ts` | 2 | Métadonnées Pump.fun & rejet slippage abusif (>50%) |
| **M2 : Money Markets** | `tests/module2-lending.test.ts` | 2 | Consultation de taux & rejet emprunt négatif |
| **M3 : Perps & Levier** | `tests/module3-perps.test.ts` | 2 | Ouverture de position & rejet de levier hors-bornes |
| **M4 : Governance & Blinks** | `tests/module4-squads.test.ts` | 2 | Création Squads v4 & rejet seuil > membres |
| **M5 : Signals & Webhooks** | `tests/module5-webhooks.test.ts` | 2 | Traitement Helius & rejet de payloads corrompus |
| **M6 : Advanced Assets** | `tests/module6-token2022.test.ts` | 2 | Taxe Token-2022 & rejet destination vide |

---

## 🔒 Security & Risk Controls

1. **Validation Input LLM** : Aucune donnée brute de LLM n'atteint le builder sans validation par schéma Zod.
2. **Simulation Gate** : Toute transaction échouant à la simulation RPC est avortée avant signature.
3. **Clés Privées** : Signature exclusive via variables d'environnement, zéro stockage de clé en dur.
4. **Erreurs Normalisées** : Restitution d'erreurs structurées (`SIMULATION_FAILED`, `LEVERAGE_EXCEEDED`, etc.) consommables par un agent.

---

## 🔍 Verification & Reproduction

```bash
git clone https://github.com/languillemax/solana-agent-skill.git
cd solana-agent-skill
npm install
npm test
npx tsc --noEmit
```
