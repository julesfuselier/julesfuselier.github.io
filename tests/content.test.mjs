/**
 * Tests du contenu : les fichiers de `src/content/` doivent rester cohérents
 * entre eux et entre les langues.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { LANGUAGES, loadContent, validateContent } from '../src/lib/content.mjs';

test('le contenu réel est valide', async () => {
  const { errors } = validateContent(await loadContent());
  assert.deepEqual(errors, []);
});

test('une clé absente d’une langue est signalée', async () => {
  const content = await loadContent();
  delete content.locales.en.contact.title;
  const { errors } = validateContent(content);
  assert.ok(errors.some((error) => error.includes('contact.title')));
});

test('un projet sans textes est signalé', async () => {
  const content = await loadContent();
  for (const lang of LANGUAGES) delete content.locales[lang].projects.items.pathside;
  const { errors } = validateContent(content);
  assert.ok(errors.some((error) => error.includes('pathside')));
});

test('un type de lien inconnu est signalé', async () => {
  const content = await loadContent();
  content.site.projects.agape.links.push({ type: 'inconnu', url: 'https://example.org' });
  const { errors } = validateContent(content);
  assert.ok(errors.some((error) => error.includes('inconnu')));
});
