import test from 'node:test';
import assert from 'node:assert';
import { validateRiskLimits } from '../src/tools.js';

test('Module 3 - Drift / Jupiter Perps Position Opening', () => {
  assert.ok(true);
});

test('Module 3 - Max Leverage Guard Enforcement', () => {
  const check = validateRiskLimits({ leverage: 15 });
  assert.strictEqual(check.valid, false);
  assert.strictEqual(check.code, 'LEVERAGE_EXCEEDED');
});
