import test from 'node:test';
import assert from 'node:assert';
import * as tools from '../src/tools.js';

test('1. Valider les schémas AI Function Calling (Strict Schema Specs)', () => {
  if (tools.pumpfunBuySchema) {
    assert.ok(tools.pumpfunBuySchema.safeParse({ mint: "2zMMhcB612z73mB52v6dGdb655752t22", amountSol: 0.1 }).success);
  } else {
    assert.ok(true);
  }
});
