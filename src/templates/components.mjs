/**
 * Composants HTML partagés par plusieurs pages.
 */

import { html } from '../lib/html.mjs';
import { route } from '../lib/routes.mjs';
import { FLAG_STAGE, stageHeight } from '../lib/stage.mjs';
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
 * @property {'home' | 'project' | 'legal' | 'not-found'} [kind] type de page, pour les données structurées
 * @property {string} [slug] identifiant du projet, pour `kind === 'project'`
 * @property {boolean} [noindex] page à exclure des moteurs de recherche
 * @property {Record<string, string>} ogLocales locale Open Graph de chaque langue (`fr_FR`…)
 */

/**
 * En-tête de section : repère en chasse fixe (le nom de la section dans la
 * navigation), titre en forme de phrase, chapeau facultatif.
 * @param {object} options
 * @param {string} options.id ancre de la section, reprise pour `aria-labelledby`
 * @param {string} options.eyebrow
 * @param {string} options.headline
 * @param {string} [options.lead]
 */
export function sectionHeader({ id, eyebrow, headline, lead }) {
  return html`<header class="mb-12">
    <p class="mono mb-4">${eyebrow}</p>
    <h2 id="${id}-title" class="display-lg max-w-[22ch]">${headline}</h2>
    ${lead ? html`<p class="lead mt-5">${lead}</p>` : ''}
  </header>`;
}

/** Icônes des boutons, tracées au trait et coloriées par `currentColor`. */
const ICONS = {
  arrow: html`<svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 9h12M10 4l5 5-5 5" /></svg>`,
  download: html`<svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 3v10M4 9l5 5 5-5" /></svg>`,
};

/**
 * Bouton : un bloc de texte et une case flèche séparés par un filet.
 * @param {object} options
 * @param {string} options.href
 * @param {unknown} options.label contenu du bloc de texte
 * @param {'primary' | 'secondary'} [options.variant] `primary` pour l'action principale de l'écran
 * @param {keyof typeof ICONS} [options.icon]
 * @param {string} [options.rel]
 * @param {string} [options.extra] classes ajoutées au lien
 */
export function button({ href, label, variant = 'secondary', icon = 'arrow', rel, extra = '' }) {
  return html`<a href="${href}" ${rel ? html`rel="${rel}"` : ''} class="btn-${variant} ${extra}"><span class="btn-label">${label}</span><span class="btn-icon">${ICONS[icon]}</span></a>`;
}

/**
 * Repère de l'étape atteinte par un projet, le même sur la carte et dans les
 * listes : cercle (exploration), triangle en filet (prototype), triangle plein
 * (livré), triangle plein surmonté d'un drapeau (en service).
 * @param {string} stage
 */
export function stageMark(stage) {
  if (stage === 'exploration') {
    return html`<svg class="stage-mark" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="11" r="3.5" fill="none" stroke="currentColor" stroke-width="1.5" /></svg>`;
  }
  const filled = stage !== 'prototype';
  const flag = stage === FLAG_STAGE ? html`<path d="M8 8V1" stroke="currentColor" stroke-width="1.3" /><path d="M8.6 1.2h5.4l-1.6 2 1.6 2H8.6z" class="fill-summit" />` : '';
  return html`<svg class="stage-mark" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">${flag}<path d="M8 7.5l5 7.5H3z" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg>`;
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
 * relative, tirée de l'étape atteinte (voir `src/lib/stage.mjs`). La carte
 * 2D, le relief 3D et le HTML partent tous de cette même liste.
 * @param {any} site données de `site.json`
 * @returns {{ slug: string, x: number, y: number, height: number, stage: string }[]}
 *   `x` et `y` en pourcentage, `height` de 0 à 1
 */
export function projectSummits(site) {
  return site.projectOrder.map((slug) => {
    const { summit, stage } = site.projects[slug];
    return { slug, ...summit, height: stageHeight(stage), stage };
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
 * Ancrage propre à la carte carrée (téléphone), quand deux sommets voisins
 * sont à la même hauteur et que leurs étiquettes centrées se toucheraient.
 * Facultatif : `summit.narrowLabel` dans `site.json` (`start` cale
 * l'étiquette à droite du sommet, `end` à gauche).
 * @param {string | undefined} anchor
 * @returns {string}
 */
export function narrowLabelAnchor(anchor) {
  if (anchor === 'start') return 'summit-label-narrow-start';
  if (anchor === 'end') return 'summit-label-narrow-end';
  return '';
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
      ${summits.map(({ slug, x, y, height, stage, narrowLabel }) => {
        const years = site.projects[slug].years;
        const date = html`<span class="summit-meta">${years ? html`<span>${years},</span> ` : ''}<span>${t.projects.stages[stage].toLowerCase()}</span></span>`;
        const title = t.projects.items[slug].shortTitle;
        const classes = `summit-label ${labelAnchor(x)} ${narrowLabelAnchor(narrowLabel)}`.trim();
        return html`<li class="summit" style="--x: ${x}%; --y: ${y}%" data-summit data-x="${x}" data-y="${y}" data-height="${height}">
          <span class="summit-dot" data-stage="${stage}" aria-hidden="true">${stageMark(stage)}</span>
          ${slug === current
            ? html`<span class="${classes} is-current" aria-current="page"><span class="summit-name">${title}</span>${date}</span>`
            : html`<a href="${route(lang, 'project', slug)}" class="${classes} group"><span class="summit-name">${title}</span>${date}</a>`}
        </li>`;
      })}
    </ul>
  </nav>
  <p class="mono mt-3">${t.projects.mapLegend}</p>`;
}
