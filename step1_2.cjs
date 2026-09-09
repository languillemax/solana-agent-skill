const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== [Étape 1] Nettoyage des fichiers temporaires ===');
if (fs.existsSync('patch_tools.js')) {
  fs.unlinkSync('patch_tools.js');
  console.log('✔ patch_tools.js supprimé.');
}

console.log('\n=== [Étape 2] Configuration package.json & .env.example ===');

const pkgPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  pkg.main = "dist/index.js";
  pkg.types = "dist/index.d.ts";
  pkg.exports = {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  };
  pkg.files = [
    "dist",
    "README.md",
    "LICENSE"
  ];
  
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = "tsc";
  pkg.scripts.prepublishOnly = "npm run build && npm test";

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('✔ package.json mis à jour.');
}

const envExampleContent = `# Server Config
PORT=3000

# Solana Network & Wallet Setup
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PRIVATE_KEY=your_base58_private_key_here

# RPC & Indexers Integrations (Helius / QuickNode)
HELIUS_API_KEY=your_helius_api_key_here
QUICKNODE_RPC_URL=your_quicknode_rpc_url_here

# DeFi Environments
DRIFT_ENV=mainnet-beta
`;

fs.writeFileSync('.env.example', envExampleContent.trim() + '\n');
console.log('✔ .env.example créé.');

console.log('\n=== Compilation de contrôle ===');
execSync('npm run build', { stdio: 'inherit' });

console.log('\n=== [Git] Commit & Push ===');
try {
  execSync('git rm patch_tools.js --cached 2>/dev/null || true', { stdio: 'inherit' });
  execSync('git add package.json .env.example', { stdio: 'inherit' });
  execSync('git add -A', { stdio: 'inherit' });
  execSync('git commit -m "chore: packaging npm config, .env.example et nettoyage repo"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✔ Push remote effectué avec succès.');
} catch (err) {
  console.log('⚠️ Remarque Git :', err.message);
}

console.log('\nÉtapes 1 et 2 finalisées avec succès.');
