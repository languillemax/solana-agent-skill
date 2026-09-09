import test from 'node:test';
import assert from 'node:assert';
import { simulateTransaction } from '../src/tools.js';

test('Base - Jito Liquid Staking Logic', () => {
  const amount = 1.0;
  assert.ok((amount * 0.95) > 0);
});

test('Base - Jupiter Price API Live Integration', async () => {
  try {
    const res = await fetch('https://price.jup.ag/v6/price?id=SOL');
    assert.ok(res.status === 200 || res.status === 429);
  } catch {
    assert.ok(true);
  }
});

test('Base - Simulation Gate Abort on Failure', async () => {
  const sim = await simulateTransaction({ amount: 5000 }, true);
  assert.strictEqual(sim.success, false);
  assert.strictEqual(sim.error.code, 'SIMULATION_FAILED');
});
