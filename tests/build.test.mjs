/**
 * Tests des pages générées : structure, liens internes, échappement.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { LANGUAGES, loadContent } from '../src/lib/content.mjs';
import { html } from '../src/lib/html.mjs';
import { outputFile, route } from '../src/lib/routes.mjs';
import { renderSite } from '../scripts/build.mjs';

const content = await loadContent();
// Le site complet est testé hors maintenance, quel que soit le réglage en
// cours ; la page de maintenance a son propre test plus bas.
const { pages, assets } = renderSite({ ...content, site: { ...content.site, maintenance: false } });
const maintenance = renderSite({ ...content, site: { ...content.site, maintenance: true } });

/** Fichiers présents dans le dépôt sans être générés par `renderSite`. */
const STATIC_FILES = ['css/style.css', 'js/site.js', 'js/map.js', 'assets/img/favicon.png', content.site.portrait.slice(1), content.site.cvPath.slice(1), 'demo/demo-SuperBomberman.html'];

test('chaque langue a son accueil, ses projets et ses mentions légales', () => {
  for (const lang of LANGUAGES) {
    assert.ok(pages[outputFile(route(lang, 'home'))]);
    assert.ok(pages[outputFile(route(lang, 'legal'))]);
    for (const slug of content.site.projectOrder) {
      assert.ok(pages[outputFile(route(lang, 'project', slug))], `${lang}/${slug}`);
    }
  }
});

test('chaque page déclare sa langue, un titre unique et un seul h1', () => {
  const titles = new Set();
  for (const [file, page] of Object.entries(pages)) {
    if (!file.endsWith('index.html')) continue;
    const lang = file.startsWith('en/') ? 'en' : 'fr';
    assert.match(page, new RegExp(`<html lang="${lang}">`), file);
    assert.equal(page.match(/<h1[ >]/g)?.length, 1, `${file} : un seul h1 attendu`);
    const title = page.match(/<title>(.*?)<\/title>/)[1];
    assert.ok(!titles.has(title), `${file} : titre en double`);
    titles.add(title);
  }
});

test('les liens internes pointent vers des fichiers existants', () => {
  const known = new Set([...Object.keys(pages), ...Object.keys(assets), ...STATIC_FILES, 'assets/fonts/space-grotesk-latin-wght-normal.woff2']);
  for (const [file, page] of Object.entries(pages)) {
    for (const [, url] of page.matchAll(/(?:href|src)="(\/[^"#]*)(?:#[^"]*)?"/g)) {
      const target = url.endsWith('/') ? `${url.slice(1)}index.html` : url.slice(1);
      assert.ok(known.has(target), `${file} : lien cassé vers ${url}`);
    }
  }
});

test('les ancres de navigation existent sur l’accueil', () => {
  for (const lang of LANGUAGES) {
    const home = pages[outputFile(route(lang, 'home'))];
    for (const [, id] of home.matchAll(/href="[^"]*#([a-z]+)"/g)) {
      assert.match(home, new RegExp(`id="${id}"`), `${lang} : ancre #${id} absente`);
    }
  }
});

test('le contenu interpolé est échappé', () => {
  assert.equal(html`<p>${'<script>'}</p>`.toString(), '<p>&lt;script&gt;</p>');
  assert.equal(html`<p>${html`<b>ok</b>`}</p>`.toString(), '<p><b>ok</b></p>');
  assert.equal(html`<p>${null}${false}${['a', 'b']}</p>`.toString(), '<p>ab</p>');
});

test('en maintenance, accueil et projets montrent le contact, les mentions légales restent', () => {
  for (const lang of LANGUAGES) {
    const t = content.locales[lang];
    const home = maintenance.pages[outputFile(route(lang, 'home'))];
    assert.ok(home.includes(t.maintenance.title), `${lang} : titre de maintenance`);
    assert.ok(home.includes(`mailto:${content.site.email}`), `${lang} : e-mail`);
    assert.ok(home.includes(content.site.social.linkedin), `${lang} : LinkedIn`);
    assert.ok(!home.includes('data-project-map'), `${lang} : plus de carte`);
    for (const slug of content.site.projectOrder) {
      assert.ok(maintenance.pages[outputFile(route(lang, 'project', slug))].includes(t.maintenance.title), `${lang}/${slug}`);
    }
    assert.ok(maintenance.pages[outputFile(route(lang, 'legal'))].includes(t.legal.title), `${lang} : mentions légales`);
  }
});
