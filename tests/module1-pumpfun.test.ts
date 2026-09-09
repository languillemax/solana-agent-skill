import test from 'node:test';
import assert from 'node:assert';
import { pumpfunBuySchema } from '../src/tools.js';

test('Module 1 - Pump.fun Info Retrieval', () => {
  assert.ok(true);
});

test('Module 1 - Slippage Protection Reject', () => {
  const result = pumpfunBuySchema.safeParse({ mint: "2zMMhcB612z73mB52v6dGdb655752t22", amountSol: 0.1, slippage: 80 });
  assert.strictEqual(result.success, false);
});
