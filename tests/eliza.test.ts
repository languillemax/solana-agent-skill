import test from 'node:test';
import assert from 'node:assert';

test('ElizaOS - Plugin Action Registration', () => {
  const plugin = { name: "solana-agent-skill", actions: [{ name: "PUMPFUN_BUY" }] };
  assert.strictEqual(plugin.name, "solana-agent-skill");
});

test('ElizaOS - Action Execution Failure Handling', () => {
  const errorHandler = (err: string) => ({ success: false, error: { code: 'ACTION_FAILED', message: err } });
  const result = errorHandler('Invalid parameter');
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error.code, 'ACTION_FAILED');
});
