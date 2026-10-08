/**
 * Composants HTML partagés par plusieurs pages.
 */

import { html } from '../lib/html.mjs';
import { projectAltitudes, relativeHeight } from '../lib/altitude.mjs';
import { route } from '../lib/routes.mjs';
import { trailPath, trailPoints } from '../lib/trail.mjs';

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
 * @property {string} [image] image de partage de la page (portrait par défaut)
 */

/**
 * En-tête de section : un titre en forme de phrase et un chapeau facultatif.
 * Pas de petit repère au-dessus du titre : la navigation nomme déjà la section.
 * @param {object} options
 * @param {string} options.id ancre de la section, reprise pour `aria-labelledby`
 * @param {string} options.headline
 * @param {string} [options.lead]
 * @param {string} [options.tone] `band` pour une section sur fond inversé
 */
export function sectionHeader({ id, headline, lead, tone }) {
  const muted = tone === 'band' ? 'text-band-body' : 'text-body';
  return html`<header class="mb-12">
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
 * Sommets rangés de gauche à droite : l'ordre dans lequel le sentier les relie.
 * @template {{ x: number }} T
 * @param {T[]} summits
 * @returns {T[]} copie triée
 */
export function byPosition(summits) {
  return [...summits].sort((a, b) => a.x - b.x);
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
 * Chaque étiquette porte l'année du projet quand elle est connue
 * (`years` dans `site.json`). Les sommets sont placés du plus ancien, à
 * gauche, au plus récent, à droite, et un sentier en pointillé les relie dans
 * cet ordre : la carte se lit comme une frise.
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
  const summits = projectSummits(site);
  return html`<nav aria-label="${label}" class="project-map text-body" data-project-map data-seed="${PROJECT_MAP_SEED}">
    <svg class="project-trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path data-trail d="${trailPath(trailPoints(byPosition(summits)))}" />
    </svg>
    <ul>
      ${summits.map(({ slug, x, y, height, altitude }) => {
        const years = site.projects[slug].years;
        const date = html`${years ? html` <span class="summit-date">${years}</span>` : ''}${
          altitude ? html`<span class="summit-altitude"><span aria-hidden="true">▲</span> ${formatAltitude(altitude, lang)}</span>` : ''
        }`;
        const title = t.projects.items[slug].shortTitle;
        const classes = `summit-label ${labelAnchor(x)}`;
        return html`<li class="summit" style="--x: ${x}%; --y: ${y}%" data-summit data-x="${x}" data-y="${y}" data-height="${height}">
          <span class="summit-dot" aria-hidden="true"></span>
          ${slug === current
            ? html`<span class="${classes} underline decoration-2 underline-offset-4" aria-current="page">${title}${date}</span>`
            : html`<a href="${route(lang, 'project', slug)}" class="${classes} group"><span class="underline decoration-transparent decoration-2 underline-offset-4 group-hover:decoration-ink">${title}</span>${date}</a>`}
        </li>`;
      })}
    </ul>
  </nav>
  ${summits.some((summit) => summit.altitude) ? html`<p class="meta mt-3 text-xs">${t.projects.mapLegend}</p>` : ''}`;
}

/**
 * Altitude en mètres, avec le séparateur de milliers de la langue.
 * @param {number} altitude
 * @param {string} lang
 * @returns {string} par exemple « 2 650 m »
 */
export function formatAltitude(altitude, lang) {
  return `${new Intl.NumberFormat(lang).format(altitude)} m`;
}
