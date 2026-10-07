import assert from 'node:assert/strict';
import { test } from 'node:test';

import { trailPath, trailPoints } from '../src/lib/trail.mjs';

const SUMMITS = [{ x: 10, y: 40 }, { x: 50, y: 20 }, { x: 90, y: 60 }];

test('le sentier passe par chaque sommet', () => {
  const points = trailPoints(SUMMITS);
  for (const summit of SUMMITS) {
    assert.ok(points.some((point) => point.x === summit.x && point.y === summit.y));
  }
  assert.deepEqual(points[0], SUMMITS[0]);
  assert.deepEqual(points.at(-1), SUMMITS.at(-1));
});

test('pas de sentier avec moins de deux sommets', () => {
  assert.deepEqual(trailPoints([SUMMITS[0]]), []);
});

test('le tracé SVG commence par un déplacement puis enchaîne des segments', () => {
  assert.equal(trailPath([{ x: 1, y: 2 }, { x: 3.456, y: 4 }]), 'M1.00 2.00L3.46 4.00');
});
