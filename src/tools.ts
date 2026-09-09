import { transferToken2022WithFee } from "./actions/token2022.js";
import { parseSolanaWebhook } from "./actions/signals.js";
import { createMultisigAccount, createMultisigProposal } from "./actions/squads.js";
import { generateBlinkUrl } from "./actions/blinks.js";
import { openPerpPosition, closePerpPosition, getPerpMarketInfo } from "./actions/perps.js";
import { executeLendingAction, getLendingRates } from "./actions/lending.js";
import { executePumpFunTrade, getPumpFunTokenInfo } from "./actions/pumpfun.js";
export const SOLANA_AGENT_TOOLS = [
  {
    name: "solana_get_portfolio",
    description: "Consulte le solde SOL, le prix actuel et la valeur USD d'un wallet Solana.",
    parameters: {
      type: "object",
      properties: {
        walletAddress: { type: "string", description: "Adresse publique Solana à analyser" }
      },
      required: ["walletAddress"]
    }
  },
  {
    name: "solana_transfer_sol",
    description: "Transfère des SOL vers une adresse destinataire sur Solana.",
    parameters: {
      type: "object",
      properties: {
        to: { type: "string", description: "Adresse Solana publique du destinataire" },
        amountSol: { type: "number", description: "Montant en SOL à transférer" }
      },
      required: ["to", "amountSol"]
    }
  },
  {
    name: "solana_jupiter_swap",
    description: "Exécute un swap de tokens via Jupiter API v6 sur Solana.",
    parameters: {
      type: "object",
      properties: {
        inputMint: { type: "string", description: "Mint token source (ex: So11111111111111111111111111111111111111112 pour SOL)" },
        outputMint: { type: "string", description: "Mint token cible" },
        amount: { type: "number", description: "Montant à swapper (unité atomique / lamports)" },
        slippageBps: { type: "number", description: "Slippage toléré en BPS (default 50 = 0.5%)" }
      },
      required: ["inputMint", "outputMint", "amount"]
    }
  },
  {
    name: "solana_jito_stake",
    description: "Obtient un devis et prépare une transaction de liquid staking JitoSOL.",
    parameters: {
      type: "object",
      properties: {
        amountSol: { type: "number", description: "Montant de SOL à staker" }
      },
      required: ["amountSol"]
    }
  }
];

export const pumpFunTools = [
  {
    name: "pumpfun_trade",
    description: "Acheter ou vendre un token sur Pump.fun / Raydium via PumpPortal",
    parameters: {
      type: "object",
      properties: {
        mint: { type: "string", description: "Adresse Mint du token" },
        action: { type: "string", enum: ["buy", "sell"], description: "Type de transaction" },
        amount: { type: "number", description: "Montant (en SOL si denominatedInSol=true, sinon en tokens)" },
        denominatedInSol: { type: "boolean", description: "Vrai si le montant est en SOL, faux si en tokens" },
        slippageBps: { type: "number", description: "Slippage en BPS (defaut 500 = 5%)" },
        priorityFee: { type: "number", description: "Frais de priorite en SOL (defaut 0.00005)" }
      },
      required: ["mint", "action", "amount", "denominatedInSol"]
    }
  },
  {
    name: "pumpfun_info",
    description: "Obtenir les details d un token sur Pump.fun (bonding curve, dev, price, etc.)",
    parameters: {
      type: "object",
      properties: {
        mint: { type: "string", description: "Adresse Mint du token" }
      },
      required: ["mint"]
    }
  }
];

export const lendingTools = [
  {
    name: "lending_rates",
    description: "Obtenir les taux d'intérêt et réserves Kamino ou Marginfi",
    parameters: {
      type: "object",
      properties: {
        protocol: { type: "string", enum: ["kamino", "marginfi"], description: "Protocole cible" }
      }
    }
  },
  {
    name: "lending_action",
    description: "Déposer, emprunter, rembourser ou retirer des actifs sur Kamino / Marginfi",
    parameters: {
      type: "object",
      properties: {
        protocol: { type: "string", enum: ["kamino", "marginfi"] },
        action: { type: "string", enum: ["deposit", "borrow", "repay", "withdraw"] },
        asset: { type: "string", description: "Symbole de l'actif (ex: SOL, USDC)" },
        amount: { type: "number", description: "Montant de la transaction" }
      },
      required: ["protocol", "action", "asset", "amount"]
    }
  }
];

export const perpsTools = [
  {
    name: "perps_market_info",
    description: "Obtenir les informations du marché Perps (prix oracle, funding rate, levier max)",
    parameters: {
      type: "object",
      properties: { market: { type: "string", description: "Symbole du marché (ex: SOL-PERP)" } }
    }
  },
  {
    name: "perps_open_position",
    description: "Ouvrir une position Perpetuals (Long/Short) avec levier",
    parameters: {
      type: "object",
      properties: {
        market: { type: "string" },
        side: { type: "string", enum: ["long", "short"] },
        leverage: { type: "number" },
        collateralAmount: { type: "number" },
        stopLossPrice: { type: "number" },
        takeProfitPrice: { type: "number" }
      },
      required: ["market", "side", "leverage", "collateralAmount"]
    }
  }
];

export const module4Tools = [
  {
    name: "squads_create_multisig",
    description: "Créer un coffre-fort Multisig Squads v4",
    parameters: {
      type: "object",
      properties: {
        threshold: { type: "number" },
        members: { type: "array", items: { type: "string" } }
      },
      required: ["threshold", "members"]
    }
  },
  {
    name: "generate_blink_url",
    description: "Générer un lien Blink Solana / Dialect à partir d'une Action URL",
    parameters: {
      type: "object",
      properties: {
        actionUrl: { type: "string" },
        label: { type: "string" }
      },
      required: ["actionUrl", "label"]
    }
  }
];

export const finalTools = [
  {
    name: "parse_webhook",
    description: "Analyser un payload webhook Helius/QuickNode",
    parameters: {
      type: "object",
      properties: { type: { type: "string" }, data: { type: "object" } },
      required: ["type"]
    }
  },
  {
    name: "token2022_transfer",
    description: "Transférer des tokens Token-2022 avec extensions de frais",
    parameters: {
      type: "object",
      properties: {
        mint: { type: "string" },
        destination: { type: "string" },
        amount: { type: "number" }
      },
      required: ["mint", "destination", "amount"]
    }
  }
];
