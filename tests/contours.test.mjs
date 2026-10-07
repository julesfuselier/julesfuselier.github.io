/**
 * Tests du générateur de cartes topographiques.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createContourMap, createRandom, hashString } from '../src/lib/contours.mjs';

test('la même graine donne la même carte', () => {
  assert.equal(createContourMap({ seed: 'agape' }).svg, createContourMap({ seed: 'agape' }).svg);
});

test('deux graines donnent deux cartes différentes', () => {
  assert.notEqual(createContourMap({ seed: 'agape' }).svg, createContourMap({ seed: 'pathside' }).svg);
});

test('le générateur aléatoire reste dans [0, 1[', () => {
  const random = createRandom(hashString('test'));
  for (let i = 0; i < 1000; i += 1) {
    const value = random();
    assert.ok(value >= 0 && value < 1);
  }
});

test('les sommets imposés sont restitués en pourcentage', () => {
  const peaks = [
    { x: 0.25, y: 0.5 },
    { x: 0.75, y: 0.2 },
  ];
  const { summits } = createContourMap({ seed: 'home', peaks });
  assert.deepEqual(summits, [
    { x: 25, y: 50 },
    { x: 75, y: 20 },
  ]);
});

test('le SVG ne contient que des coordonnées finies', () => {
  const { svg } = createContourMap({ seed: 'home', width: 900, height: 720 });
  assert.match(svg, /^<svg /);
  assert.doesNotMatch(svg, /NaN|Infinity/);
});
