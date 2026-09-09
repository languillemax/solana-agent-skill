import { parseSolanaWebhook } from "./actions/signals.js";
import { transferToken2022WithFee } from "./actions/token2022.js";
import { createMultisigAccount, createMultisigProposal } from "./actions/squads.js";
import { generateBlinkUrl } from "./actions/blinks.js";
import { openPerpPosition, closePerpPosition, getPerpMarketInfo } from "./actions/perps.js";
import { executeLendingAction, getLendingRates } from "./actions/lending.js";
import { Connection, Keypair } from "@solana/web3.js";
import express from "express";
import { executePumpFunTrade, getPumpFunTokenInfo } from "./actions/pumpfun.js";
import { SOLANA_AGENT_TOOLS } from "./tools.js";
import { getPortfolio } from "./actions/portfolio.js";
import { getJitoStakeQuote } from "./actions/stake.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DEFAULT_RPC = "https://api.mainnet-beta.solana.com";

app.get("/health", (req: any, res: any) => {
  res.json({ status: "ok", service: "solana-agent-skill-api" });
});

app.get("/tools", (req: any, res: any) => {
  res.json({ tools: SOLANA_AGENT_TOOLS });
});

app.post("/portfolio", async (req: any, res: any) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ error: "walletAddress requis" });
    const data = await getPortfolio(DEFAULT_RPC, walletAddress);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/stake/jito", async (req: any, res: any) => {
  try {
    const { amountSol } = req.body;
    const data = await getJitoStakeQuote(amountSol || 1);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/pumpfun/trade", async (req: any, res: any) => {
  try {
    const connection = new Connection(req.body.rpcUrl || DEFAULT_RPC, "confirmed");
    const wallet = req.body.privateKey
      ? Keypair.fromSecretKey(Uint8Array.from(JSON.parse(req.body.privateKey)))
      : Keypair.generate();
    const result = await executePumpFunTrade(connection, wallet, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/pumpfun/info/:mint", async (req: any, res: any) => {
  try {
    const data = await getPumpFunTokenInfo(req.params.mint);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});


app.get("/api/lending/rates", async (req: any, res: any) => {
  try {
    const protocol = (req.query.protocol as "kamino" | "marginfi") || "kamino";
    const data = await getLendingRates(protocol);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/lending/action", async (req: any, res: any) => {
  try {
    const connection = new Connection(req.body.rpcUrl || DEFAULT_RPC, "confirmed");
    const wallet = req.body.privateKey
      ? Keypair.fromSecretKey(Uint8Array.from(JSON.parse(req.body.privateKey)))
      : Keypair.generate();
    const result = await executeLendingAction(connection, wallet, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});


app.get("/api/perps/market/:symbol", async (req: any, res: any) => {
  try {
    const data = await getPerpMarketInfo(req.params.symbol);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/perps/open", async (req: any, res: any) => {
  try {
    const connection = new Connection(req.body.rpcUrl || DEFAULT_RPC, "confirmed");
    const wallet = req.body.privateKey
      ? Keypair.fromSecretKey(Uint8Array.from(JSON.parse(req.body.privateKey)))
      : Keypair.generate();
    const result = await openPerpPosition(connection, wallet, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});


app.post("/api/squads/create", async (req: any, res: any) => {
  try {
    const connection = new Connection(req.body.rpcUrl || DEFAULT_RPC, "confirmed");
    const wallet = req.body.privateKey
      ? Keypair.fromSecretKey(Uint8Array.from(JSON.parse(req.body.privateKey)))
      : Keypair.generate();
    const result = await createMultisigAccount(connection, wallet, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/blinks/generate", (req: any, res: any) => {
  try {
    const result = generateBlinkUrl(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});


app.post("/api/webhook/solana", (req: any, res: any) => {
  try {
    const result = parseSolanaWebhook(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/token2022/transfer", async (req: any, res: any) => {
  try {
    const connection = new Connection(req.body.rpcUrl || DEFAULT_RPC, "confirmed");
    const wallet = req.body.privateKey
      ? Keypair.fromSecretKey(Uint8Array.from(JSON.parse(req.body.privateKey)))
      : Keypair.generate();
    const result = await transferToken2022WithFee(connection, wallet, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
