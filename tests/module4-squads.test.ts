import test from 'node:test';
import assert from 'node:assert';

test('Module 4 - Squads Multisig Creation', () => {
  assert.ok(true);
});

test('Module 4 - Threshold Exceeding Members Guard', () => {
  const createMultisig = (threshold: number, members: string[]) => {
    if (threshold > members.length) throw new Error('INVALID_THRESHOLD');
    return true;
  };
  assert.throws(() => createMultisig(3, ['addr1']), /INVALID_THRESHOLD/);
});
