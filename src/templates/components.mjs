/**
 * Composants HTML partagés par plusieurs pages.
 */

import { html } from '../lib/html.mjs';

/**
 * @typedef {object} PageContext
 * @property {string} lang langue de la page (`fr` ou `en`)
 * @property {any} t textes de la langue (`src/content/<lang>.json`)
 * @property {any} site données communes (`src/content/site.json`)
 * @property {string} url adresse de la page
 * @property {Record<string, string>} alternates adresse de la même page dans chaque langue
 * @property {string} title titre de la page
 * @property {string} description description pour les moteurs de recherche
 */

/**
 * Liste de données courtes séparées par des virgules (technologies).
 * @param {string[]} items
 */
export function datumList(items) {
  if (items.length === 0) return '';
  return html`<p class="datum">${items.join(', ')}</p>`;
}

/**
 * Section en deux colonnes : titre à gauche, contenu à droite.
 * @param {object} options
 * @param {string} options.id ancre de la section
 * @param {string} options.title
 * @param {import('../lib/html.mjs').SafeHtml} options.body
 * @param {string} [options.classes] classes de la balise `<section>`
 */
export function section({ id, title, body, classes = '' }) {
  return html`<section id="${id}" class="border-t border-line py-16 sm:py-20 ${classes}" aria-labelledby="${id}-title">
    <div class="page legend-grid">
      <h2 id="${id}-title" class="section-title">${title}</h2>
      <div>${body}</div>
    </div>
  </section>`;
}

/**
 * Liste à puces sobre.
 * @param {string[]} items
 * @param {string} [classes]
 */
export function bulletList(items, classes = '') {
  return html`<ul class="max-w-[38rem] list-disc space-y-2 pl-5 leading-relaxed marker:text-muted ${classes}">
    ${items.map((item) => html`<li>${item}</li>`)}
  </ul>`;
}
