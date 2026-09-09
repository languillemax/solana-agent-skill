import assert from "node:assert/strict";
import { test, describe } from "node:test";
import { 
  SOLANA_AGENT_TOOLS, 
  solanaAgentPlugin, 
  getPortfolio, 
  getJitoStakeQuote 
} from "./src/index.js";
import express from "express";
import http from "node:http";

describe("--- BATTERIE DE TESTS INDUSTRIELLE ---", () => {

  test("1. Valider les schémas AI Function Calling (Strict Schema Specs)", () => {
    assert.equal(Array.isArray(SOLANA_AGENT_TOOLS), true, "SOLANA_AGENT_TOOLS doit être un tableau");
    assert.equal(SOLANA_AGENT_TOOLS.length, 4, "Exactement 4 outils doivent être exportés");

    for (const tool of SOLANA_AGENT_TOOLS) {
      assert.ok(tool.name, "Chaque outil doit avoir un nom");
      assert.ok(tool.description, "Chaque outil doit avoir une description");
      assert.equal(tool.parameters.type, "object", "Les paramètres doivent être de type object");
      assert.ok(tool.parameters.properties, "Les propriétés doivent être définies");
      assert.ok(Array.isArray(tool.parameters.required), "Les champs requis doivent être un tableau");
    }
  });

  test("2. Valider le contrat du Plugin ElizaOS", async () => {
    assert.equal(solanaAgentPlugin.name, "solana-agent-skill");
    assert.equal(solanaAgentPlugin.actions.length, 4);

    for (const action of solanaAgentPlugin.actions) {
      assert.ok(action.name);
      assert.ok(action.description);
      const res = await action.simulatedHandler();
      assert.equal(res.success, true);
      assert.ok(res.message.includes(action.name));
    }
  });

  test("3. Valider la logique de Staking Liquide Jito", async () => {
    const amount = 10.5;
    const quote = await getJitoStakeQuote(amount);
    
    assert.equal(quote.protocol, "Jito");
    assert.equal(quote.inputAmountSol, amount);
    assert.equal(quote.targetMint, "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn");
    assert.equal(quote.status, "ready");
  });

  test("4. Valider l'appel Portfolio & API Jupiter Price v2 (Integration Live)", async () => {
    const testWallet = "5YNmS1R9nNSCDzb5a7yE1L88zA28nArX8RjeXe15k3S";
    const data = await getPortfolio("https://api.mainnet-beta.solana.com", testWallet);

    assert.equal(data.wallet, testWallet);
    assert.equal(typeof data.solBalance, "number");
    assert.equal(typeof data.solPriceUsd, "number");
    assert.equal(typeof data.totalValueUsd, "number");
    assert.ok(data.solBalance >= 0, "Le solde ne peut pas être négatif");
  });

  test("5. Test E2E Serveur REST Microservice (Serveur HTTP réel)", async () => {
    const app = express();
    app.use(express.json());
    
    app.get("/health", (req, res) => res.json({ status: "ok" }));
    app.get("/tools", (req, res) => res.json({ tools: SOLANA_AGENT_TOOLS }));
    app.post("/stake/jito", async (req, res) => {
      const quote = await getJitoStakeQuote(req.body.amountSol || 1);
      res.json(quote);
    });

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    
    const address = server.address() as any;
    const baseUrl = `http://localhost:${address.port}`;

    // Test /health
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json() as any;
    assert.equal(healthRes.status, 200);
    assert.equal(healthJson.status, "ok");

    // Test /tools
    const toolsRes = await fetch(`${baseUrl}/tools`);
    const toolsJson = await toolsRes.json() as any;
    assert.equal(toolsRes.status, 200);
    assert.equal(toolsJson.tools.length, 4);

    // Test /stake/jito
    const stakeRes = await fetch(`${baseUrl}/stake/jito`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountSol: 2 })
    });
    const stakeJson = await stakeRes.json() as any;
    assert.equal(stakeRes.status, 200);
    assert.equal(stakeJson.inputAmountSol, 2);

    server.close();
  });

});
