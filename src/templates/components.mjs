/**
 * Composants HTML partagés par plusieurs pages.
 */

import { html } from '../lib/html.mjs';
import { projectAltitudes, relativeHeight } from '../lib/altitude.mjs';
import { route } from '../lib/routes.mjs';

/** Graine du relief : la carte 2D et le relief 3D doivent utiliser la même. */
export const PROJECT_MAP_SEED = 'projects';

/** Formats de la carte des projets (fichiers `assets/contours/projects-<format>.svg`). */
export const PROJECT_MAPS = {
  square: { width: 800, height: 800 },
  wide: { width: 1500, height: 600 },
};

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
 * En-tête de section : repère en chasse fixe (le nom de la section dans la
 * navigation), titre en forme de phrase, chapeau facultatif.
 * @param {object} options
 * @param {string} options.id ancre de la section, reprise pour `aria-labelledby`
 * @param {string} options.eyebrow
 * @param {string} options.headline
 * @param {string} [options.lead]
 * @param {string} [options.tone] `band` pour une section sur fond inversé
 */
export function sectionHeader({ id, eyebrow, headline, lead, tone }) {
  const muted = tone === 'band' ? 'text-band-body' : 'text-body';
  return html`<header class="mb-12">
    <p class="mono mb-4 ${muted}">${eyebrow}</p>
    <h2 id="${id}-title" class="display-lg max-w-[24ch]">${headline}</h2>
    ${lead ? html`<p class="lead mt-4 ${muted}">${lead}</p>` : ''}
  </header>`;
}

/**
 * Liste à puces sobre.
 * @param {string[]} items
 */
export function bulletList(items) {
  return html`<ul class="max-w-[40rem] list-disc space-y-2 pl-5 leading-7 marker:text-body">
    ${items.map((item) => html`<li>${item}</li>`)}
  </ul>`;
}

/**
 * Sommets de la carte, dans l'ordre des projets : position et hauteur
 * relative (tirée des heures passées, voir `src/lib/altitude.mjs`). La carte
 * 2D, le relief 3D et le HTML partent tous de cette même liste.
 * @param {any} site données de `site.json`
 * @returns {{ slug: string, x: number, y: number, height: number, altitude: number | undefined }[]}
 *   `x` et `y` en pourcentage, `height` de 0 à 1, `altitude` en mètres si connue
 */
export function projectSummits(site) {
  const altitudes = projectAltitudes(site.projects);
  return site.projectOrder.map((slug) => {
    const altitude = altitudes?.[slug];
    return { slug, ...site.projects[slug].summit, height: relativeHeight(altitude), altitude };
  });
}

/**
 * Classe d'ancrage de l'étiquette d'un sommet, pour qu'elle ne sorte jamais
 * de la carte : calée à gauche près du bord gauche, à droite près du bord
 * droit, centrée ailleurs. Les noms de classe sont écrits en entier pour que
 * Tailwind les retrouve dans ce fichier et les conserve.
 * @param {number} x position horizontale du sommet, en pourcentage
 * @returns {string}
 */
export function labelAnchor(x) {
  if (x < 25) return 'summit-label-start';
  if (x > 75) return 'summit-label-end';
  return 'summit-label-center';
}

/**
 * Carte topographique des projets : un sommet par projet, chaque sommet est
 * un lien. C'est le seul décor du site, et il sert de navigation.
 *
 * Sur une page de projet, `current` désigne le projet affiché : son sommet
 * est marqué comme page courante et n'est plus un lien.
 *
 * Les attributs `data-*` servent au relief 3D (`src/js/terrain.js`), qui
 * remplace le fond de la carte quand le navigateur le permet.
 * @param {PageContext} ctx
 * @param {object} options
 * @param {string} options.label nom accessible de la carte
 * @param {string} [options.current] identifiant du projet affiché
 */
export function projectMap(ctx, { label, current }) {
  const { site, t, lang } = ctx;
  return html`<nav aria-label="${label}" class="project-map text-body" data-project-map data-seed="${PROJECT_MAP_SEED}">
    <ul>
      ${projectSummits(site).map(({ slug, x, y, height }) => {
        const name = t.projects.items[slug].shortTitle;
        const classes = `summit-label ${labelAnchor(x)}`;
        return html`<li class="summit" style="--x: ${x}%; --y: ${y}%" data-summit data-x="${x}" data-y="${y}" data-height="${height}">
          <span class="summit-dot" aria-hidden="true"></span>
          ${slug === current
            ? html`<span class="${classes} ring-1 ring-inset ring-ink" aria-current="page">${name}</span>`
            : html`<a href="${route(lang, 'project', slug)}" class="${classes} underline decoration-hairline decoration-2 underline-offset-4 hover:decoration-ink">${name}</a>`}
        </li>`;
      })}
    </ul>
  </nav>`;
}
