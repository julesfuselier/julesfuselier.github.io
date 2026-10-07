import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ALTITUDE, altitudeFromHours, projectAltitudes, relativeHeight } from '../src/lib/altitude.mjs';

test('le projet le plus court est au socle, le plus long au sommet', () => {
  assert.equal(altitudeFromHours(20, 20, 300), ALTITUDE.min);
  assert.equal(altitudeFromHours(300, 20, 300), ALTITUDE.max);
});

test("l'échelle est logarithmique : le milieu géométrique est à mi-hauteur", () => {
  // ln(1 + 99) est à mi-chemin entre ln(1 + 9) et ln(1 + 999).
  const middle = (ALTITUDE.min + ALTITUDE.max) / 2;
  assert.ok(Math.abs(altitudeFromHours(99, 9, 999) - middle) < 1e-9);
});

test('des durées toutes égales donnent le même sommet', () => {
  assert.deepEqual(projectAltitudes({ a: { hours: 50 }, b: { hours: 50 } }), { a: ALTITUDE.max, b: ALTITUDE.max });
});

test("aucune altitude tant qu'il manque les heures d'un projet", () => {
  assert.equal(projectAltitudes({ a: { hours: 50 }, b: { hours: null } }), null);
  assert.equal(projectAltitudes({ a: { hours: 50 }, b: {} }), null);
});

test('sans altitude, un sommet garde la hauteur maximale', () => {
  assert.equal(relativeHeight(undefined), 1);
  assert.equal(relativeHeight(ALTITUDE.max), 1);
});
