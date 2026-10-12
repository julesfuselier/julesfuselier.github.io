import assert from 'node:assert/strict';
import { test } from 'node:test';

import { STAGES, isStage, stageHeight } from '../src/lib/stage.mjs';

test('les étapes montent de l’exploration à la mise en service', () => {
  const heights = Object.values(STAGES);
  assert.deepEqual(heights, [...heights].sort((a, b) => a - b));
  assert.equal(stageHeight('in-service'), 1);
});

test('une étape inconnue est refusée et prend la hauteur la plus basse', () => {
  assert.equal(isStage('termine'), false);
  assert.equal(isStage('toString'), false);
  assert.equal(stageHeight('termine'), STAGES.exploration);
});
