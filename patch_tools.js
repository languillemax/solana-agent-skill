const fs = require('fs');
const file = 'src/tools.ts';
let content = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';

if (!content.includes('executePumpFunTrade')) {
  const importStmt = `import { executePumpFunTrade, getPumpFunTokenInfo } from "./actions/pumpfun";\n`;
  content = importStmt + content;

  const newTools = `\nexport const pumpFunTools = [
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
];\n`;

  content += newTools;
  fs.writeFileSync(file, content, 'utf8');
  console.log('src/tools.ts mis a jour avec succes.');
} else {
  console.log('Les outils Pump.fun sont deja presents dans src/tools.ts.');
}
