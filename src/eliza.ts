import { openPerpPosition, closePerpPosition, getPerpMarketInfo } from "./actions/perps.js";
import { executeLendingAction, getLendingRates } from "./actions/lending.js";
import { executePumpFunTrade, getPumpFunTokenInfo } from "./actions/pumpfun.js";
import { SOLANA_AGENT_TOOLS } from "./tools.js";

export const solanaAgentPlugin = {
  name: "solana-agent-skill",
  description: "Plugin d'exécution Solana pour ElizaOS (Jupiter v6 Swaps & Transferts)",
  actions: SOLANA_AGENT_TOOLS.map(tool => ({
    name: tool.name,
    description: tool.description,
    simulatedHandler: async () => {
      return { success: true, message: `Action ${tool.name} prête pour exécution.` };
    }
  }))
};

export const pumpFunTradeAction = {
  name: "PUMP_FUN_TRADE",
  description: "Acheter ou vendre un token sur Pump.fun / Raydium",
  handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
    try {
      const { connection, wallet } = runtime;
      const res = await executePumpFunTrade(connection, wallet, options);
      if (callback) callback({ text: JSON.stringify(res) });
      return res.success;
    } catch (err: any) {
      if (callback) callback({ text: err.message });
      return false;
    }
  }
};

export const pumpFunInfoAction = {
  name: "PUMP_FUN_INFO",
  description: "Obtenir les details d'un token sur Pump.fun",
  handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
    try {
      const data = await getPumpFunTokenInfo(options.mint);
      if (callback) callback({ text: JSON.stringify(data) });
      return true;
    } catch (err: any) {
      if (callback) callback({ text: err.message });
      return false;
    }
  }
};

export const lendingRatesAction = {
  name: "LENDING_RATES",
  description: "Consulter les taux de prêt/emprunt",
  handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
    try {
      const res = await getLendingRates(options?.protocol || "kamino");
      if (callback) callback({ text: JSON.stringify(res) });
      return res.success;
    } catch (err: any) {
      if (callback) callback({ text: err.message });
      return false;
    }
  }
};

export const lendingExecuteAction = {
  name: "LENDING_EXECUTE",
  description: "Exécuter une opération de prêt/emprunt",
  handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
    try {
      const { connection, wallet } = runtime;
      const res = await executeLendingAction(connection, wallet, options);
      if (callback) callback({ text: JSON.stringify(res) });
      return res.success;
    } catch (err: any) {
      if (callback) callback({ text: err.message });
      return false;
    }
  }
};

export const perpOpenAction = {
  name: "PERP_OPEN_POSITION",
  description: "Ouvrir une position de trading à levier (Perpetuals)",
  handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
    try {
      const { connection, wallet } = runtime;
      const res = await openPerpPosition(connection, wallet, options);
      if (callback) callback({ text: JSON.stringify(res) });
      return res.success;
    } catch (err: any) {
      if (callback) callback({ text: err.message });
      return false;
    }
  }
};
