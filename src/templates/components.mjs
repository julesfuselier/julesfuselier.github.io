/**
 * Composants HTML partagés par plusieurs pages.
 */

import { html } from '../lib/html.mjs';
import { route } from '../lib/routes.mjs';

/** Identifiant de la carte des projets (fichier `assets/contours/projects.svg`). */
export const PROJECT_MAP = 'projects';

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

/**
 * Carte topographique des projets : un sommet par projet.
 *
 * Sur l'accueil (`current` absent), chaque sommet est un lien étiqueté : la
 * carte sert de navigation. Sur une page de projet, seul le sommet du projet
 * affiché est plein et étiqueté : la carte situe le projet parmi les autres.
 * @param {PageContext} ctx
 * @param {object} options
 * @param {string} options.label nom accessible de la carte
 * @param {string} [options.current] identifiant du projet affiché
 * @param {string} [options.classes] classes de taille
 */
export function projectMap(ctx, { label, current, classes = '' }) {
  const { site, t, lang } = ctx;
  const labelClasses = 'absolute -top-3 whitespace-nowrap bg-paper px-1.5 py-0.5 text-sm font-medium text-ink';

  return html`<nav aria-label="${label}" class="contour aspect-[5/4] text-muted ${classes}" style="--contour: url('/assets/contours/${PROJECT_MAP}.svg')">
    <ul>
      ${site.projectOrder.map((slug) => {
        const { x, y } = site.projects[slug].summit;
        const name = t.projects.items[slug].shortTitle;
        // L'étiquette passe à gauche du repère dans la moitié droite de la carte.
        const side = x > 50 ? 'right-3 text-right' : 'left-3';
        const position = html`style="--x: ${x}%; --y: ${y}%"`;

        if (current && slug !== current) {
          return html`<li class="summit" ${position}>
            <a href="${route(lang, 'project', slug)}" class="summit-dot summit-dot-other" title="${name}"><span class="sr-only">${name}</span></a>
          </li>`;
        }
        return html`<li class="summit" ${position}>
          <span class="summit-dot"></span>
          ${current
            ? html`<span class="${labelClasses} ${side}" aria-current="page">${name}</span>`
            : html`<a href="${route(lang, 'project', slug)}" class="${labelClasses} ${side} underline decoration-line underline-offset-4 hover:decoration-ink">${name}</a>`}
        </li>`;
      })}
    </ul>
  </nav>`;
}
