/**
 * Pages de texte simples : mentions légales et page 404.
 */

import { html } from '../lib/html.mjs';
import { route } from '../lib/routes.mjs';

/** @typedef {import('./components.mjs').PageContext} PageContext */

/**
 * Mentions légales. Le SIRET n'est affiché que s'il est renseigné dans
 * `site.json` ; la compilation avertit tant qu'il manque.
 * @param {PageContext} ctx
 * @returns {import('../lib/html.mjs').SafeHtml}
 */
export function legalPage(ctx) {
  const { site, t } = ctx;
  return html`<article class="page py-16 sm:py-24">
    <h1 class="display-xl">${t.legal.title}</h1>
    ${t.legal.sections.map(
      (part, index) => html`<section class="mt-12 max-w-[40rem]">
        <h2 class="display-md">${part.title}</h2>
        ${part.paragraphs.map((text) => html`<p class="mt-2 leading-7">${text}</p>`)}
        ${index === 0 && site.publisher.siret ? html`<p class="meta mt-2">${t.legal.siretLabel} ${site.publisher.siret}</p>` : ''}
      </section>`,
    )}
  </article>`;
}

/**
 * Page 404, bilingue : GitHub Pages sert le même fichier pour toutes les
 * adresses inconnues, quelle que soit la langue.
 * @param {Record<string, any>} locales textes de chaque langue
 * @returns {import('../lib/html.mjs').SafeHtml}
 */
export function notFoundPage(locales) {
  return html`<div class="page py-24">
    ${Object.entries(locales).map(
      ([lang, t]) => html`<section lang="${lang}" class="mb-16 max-w-[40rem]">
        <h1 class="display-lg">${t.notFound.title}</h1>
        <p class="lead mt-4">${t.notFound.text}</p>
        <a href="${route(lang, 'home')}" class="link mt-4 inline-block">${t.notFound.cta}</a>
      </section>`,
    )}
  </div>`;
}
