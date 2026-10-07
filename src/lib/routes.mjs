/**
 * Adresses des pages, par langue.
 *
 * Le français est servi à la racine, l'anglais sous `/en/`. Toutes les
 * adresses sont absolues depuis la racine du domaine et se terminent par `/`
 * (chaque page est un `index.html` dans son dossier).
 */

/** @typedef {'home' | 'project' | 'legal'} PageKind */

const ROUTES = {
  fr: {
    home: () => '/',
    project: (slug) => `/projets/${slug}/`,
    legal: () => '/mentions-legales/',
  },
  en: {
    home: () => '/en/',
    project: (slug) => `/en/projects/${slug}/`,
    legal: () => '/en/legal/',
  },
};

/**
 * Adresse d'une page dans une langue.
 * @param {string} lang
 * @param {PageKind} kind
 * @param {string} [slug] identifiant du projet, pour `kind === 'project'`
 * @returns {string}
 */
export function route(lang, kind, slug) {
  return ROUTES[lang][kind](slug);
}

/**
 * Chemin du fichier à écrire pour une adresse de page.
 * @param {string} url adresse renvoyée par `route`
 * @returns {string} chemin relatif à la racine du dépôt
 */
export function outputFile(url) {
  return `${url.slice(1)}index.html`;
}

/** Dossiers entièrement générés, supprimés avant chaque compilation. */
export const GENERATED_DIRS = ['en', 'projets', 'mentions-legales', 'assets/contours', 'assets/fonts'];
