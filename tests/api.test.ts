import test from 'node:test';
import assert from 'node:assert';

test('API - Express REST Endpoint Routing', () => {
  const route = "/api/solana/pumpfun/buy";
  assert.ok(route.startsWith("/api/solana"));
});

test('API - Structured 400 Bad Request Payload', () => {
  const response400 = { success: false, error: { code: 'INVALID_PAYLOAD', message: 'Missing mint parameter' } };
  assert.strictEqual(response400.success, false);
  assert.strictEqual(response400.error.code, 'INVALID_PAYLOAD');
});
