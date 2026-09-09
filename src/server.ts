import express from "express";
import { SOLANA_AGENT_TOOLS } from "./tools.js";
import { getPortfolio } from "./actions/portfolio.js";
import { getJitoStakeQuote } from "./actions/stake.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DEFAULT_RPC = "https://api.mainnet-beta.solana.com";

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "solana-agent-skill-api" });
});

app.get("/tools", (req, res) => {
  res.json({ tools: SOLANA_AGENT_TOOLS });
});

app.post("/portfolio", async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ error: "walletAddress requis" });
    const data = await getPortfolio(DEFAULT_RPC, walletAddress);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/stake/jito", async (req, res) => {
  try {
    const { amountSol } = req.body;
    const data = await getJitoStakeQuote(amountSol || 1);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur Solana Agent Skill actif sur http://localhost:${PORT}`);
  });
}
