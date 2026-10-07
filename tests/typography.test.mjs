/**
 * Tests de la correction typographique.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { typeset, typesetDeep } from '../src/lib/typography.mjs';

test('les apostrophes droites deviennent courbes dans les deux langues', () => {
  assert.equal(typeset('fr', "l'IA"), 'l’IA');
  assert.equal(typeset('en', "it's"), 'it’s');
});

test('le français reçoit des espaces insécables avant la ponctuation double', () => {
  assert.equal(typeset('fr', 'Durée : 6 mois'), 'Durée : 6 mois');
  assert.equal(typeset('fr', 'Prêt ?'), 'Prêt ?');
  assert.equal(typeset('fr', '« oui »'), '« oui »');
});

test('l’anglais garde ses espaces ordinaires', () => {
  assert.equal(typeset('en', 'Duration: 6 months'), 'Duration: 6 months');
});

test('la correction traverse objets et tableaux sans toucher aux autres valeurs', () => {
  assert.deepEqual(typesetDeep('fr', { a: ["l'un"], b: null, c: 3 }), { a: ['l’un'], b: null, c: 3 });
});
