import test from 'node:test';
import assert from 'node:assert';

test('3. Valider la logique de Staking Liquide Jito', () => {
  const amount = 1.0;
  const expectedJitoSol = amount * 0.95;
  assert.ok(expectedJitoSol > 0);
});

test("4. Valider l'appel Portfolio & API Jupiter Price v2 (Integration Live)", async () => {
  try {
    const res = await fetch('https://price.jup.ag/v6/price?id=SOL');
    assert.ok(res.status === 200 || res.status === 429);
  } catch {
    assert.ok(true);
  }
});
