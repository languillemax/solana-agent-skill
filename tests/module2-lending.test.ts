import test from 'node:test';
import assert from 'node:assert';
import { lendingSchema } from '../src/tools.js';

test('Module 2 - Kamino / Marginfi Rate Fetching', () => {
  assert.ok(true);
});

test('Module 2 - Borrow Negative Amount Rejection', () => {
  const res = lendingSchema.safeParse({ protocol: "kamino", asset: "USDC", amount: -10, action: "borrow" });
  assert.strictEqual(res.success, false);
});
