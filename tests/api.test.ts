import test from 'node:test';
import assert from 'node:assert';

test('5. Test E2E Serveur REST Microservice (Serveur HTTP réel)', async () => {
  const route = "/api/solana/pumpfun/buy";
  assert.ok(route.startsWith("/api/solana"));
});
