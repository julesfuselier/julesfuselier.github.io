/**
 * Tests du générateur de cartes topographiques.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createContourMap, createRandom, hashString } from '../src/lib/contours.mjs';

const PEAKS = [
  { x: 0.25, y: 0.5 },
  { x: 0.75, y: 0.2 },
];

test('la même graine et les mêmes sommets donnent la même carte', () => {
  assert.equal(createContourMap({ seed: 'a', peaks: PEAKS }), createContourMap({ seed: 'a', peaks: PEAKS }));
});

test('changer la graine ou un sommet change la carte', () => {
  const reference = createContourMap({ seed: 'a', peaks: PEAKS });
  assert.notEqual(reference, createContourMap({ seed: 'b', peaks: PEAKS }));
  assert.notEqual(reference, createContourMap({ seed: 'a', peaks: [PEAKS[0], { x: 0.6, y: 0.8 }] }));
});

test('le générateur aléatoire reste dans [0, 1[', () => {
  const random = createRandom(hashString('test'));
  for (let i = 0; i < 1000; i += 1) {
    const value = random();
    assert.ok(value >= 0 && value < 1);
  }
});

test('le SVG respecte les dimensions demandées et ne contient que des coordonnées finies', () => {
  const svg = createContourMap({ seed: 'a', peaks: PEAKS, width: 300, height: 200 });
  assert.match(svg, /^<svg [^>]*viewBox="0 0 300 200"/);
  assert.doesNotMatch(svg, /NaN|Infinity/);
});
