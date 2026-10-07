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
  return html`<article class="page py-12 sm:py-16">
    <h1 class="text-4xl font-semibold tracking-tight">${t.legal.title}</h1>
    ${t.legal.sections.map(
      (part, index) => html`<section class="mt-10 max-w-[38rem]">
        <h2 class="subheading text-xl">${part.title}</h2>
        ${part.paragraphs.map((text) => html`<p class="mt-2 leading-relaxed">${text}</p>`)}
        ${index === 0 && site.publisher.siret ? html`<p class="mt-2 leading-relaxed">${t.legal.siretLabel} : ${site.publisher.siret}</p>` : ''}
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
  return html`<div class="page py-20">
    ${Object.entries(locales).map(
      ([lang, t]) => html`<section lang="${lang}" class="mb-12 max-w-[38rem]">
        <h1 class="text-4xl font-semibold tracking-tight">${t.notFound.title}</h1>
        <p class="lead mt-4">${t.notFound.text}</p>
        <a href="${route(lang, 'home')}" class="link mt-4 inline-block">${t.notFound.cta}</a>
      </section>`,
    )}
  </div>`;
}
