import { test } from 'node:test';
import assert from 'node:assert/strict';
import { t3nAdapter } from '../src/t3n.js';

test('T3N Adapter - Exposes available tools', () => {
  const tools = t3nAdapter.getAvailableTools();
  assert.ok(tools.length >= 3);
  assert.ok(tools.some(t => t.name === 'PUMPFUN_BUY'));
});

test('T3N Adapter - Rejects invalid parameters via Zod', async () => {
  const res = await t3nAdapter.executeAction({
    toolName: 'PUMPFUN_BUY',
    parameters: { mint: 'short', amountSol: -1 }
  });
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.error?.code, 'INVALID_PARAMETERS');
});

test('T3N Adapter - Rejects actions exceeding risk limits', async () => {
  const res = await t3nAdapter.executeAction({
    toolName: 'PUMPFUN_BUY',
    parameters: { mint: 'So11111111111111111111111111111111111111112', amountSol: 500, slippage: 1 }
  });
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.error?.code, 'RISK_LIMIT_EXCEEDED');
});

test('T3N Adapter - Executes valid action through Simulation Gate', async () => {
  const res = await t3nAdapter.executeAction({
    toolName: 'PUMPFUN_BUY',
    parameters: { mint: 'So11111111111111111111111111111111111111112', amountSol: 1, slippage: 1 }
  });
  assert.strictEqual(res.success, true);
  assert.ok(res.data.executed);
});
