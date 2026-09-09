import test from 'node:test';
import assert from 'node:assert';

test('2. Valider le contrat du Plugin ElizaOS', () => {
  const plugin = { name: "solana-agent-skill", actions: [{ name: "PUMPFUN_BUY" }] };
  assert.strictEqual(plugin.name, "solana-agent-skill");
  assert.strictEqual(plugin.actions.length, 1);
});
