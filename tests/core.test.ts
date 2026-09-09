import test from 'node:test';
import assert from 'node:assert';
import { pumpfunBuySchema, lendingSchema, perpsSchema, validateRiskLimits } from '../src/tools.js';

test('Core - Schema Zod (Happy Path)', () => {
  assert.ok(pumpfunBuySchema.safeParse({ mint: "2zMMhcB612z73mB52v6dGdb655752t22", amountSol: 0.1 }).success);
});

test('Core - Schema Zod (Negative: Negative Amount & Invalid Leverage)', () => {
  const badAmount = pumpfunBuySchema.safeParse({ mint: "2zMMhcB612z73mB52v6dGdb655752t22", amountSol: -0.5 });
  assert.strictEqual(badAmount.success, false);

  const badLeverage = perpsSchema.safeParse({ market: "SOL-PERP", side: "long", amount: 1, leverage: 25 });
  assert.strictEqual(badLeverage.success, false);
});

test('Core - Risk Engine (Gate Check)', () => {
  const overLimit = validateRiskLimits({ amount: 50, leverage: 20 });
  assert.strictEqual(overLimit.valid, false);
});
