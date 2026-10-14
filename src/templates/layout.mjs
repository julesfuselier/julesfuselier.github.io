/**
 * Enveloppe commune à toutes les pages : `<head>`, en-tête, pied de page.
 */

import { html, raw } from '../lib/html.mjs';
import { LANGUAGES } from '../lib/content.mjs';
import { route } from '../lib/routes.mjs';

/** @typedef {import('./components.mjs').PageContext} PageContext */

/**
 * Applique le thème enregistré avant le premier affichage, pour éviter un
 * flash, et signale un retour dans la session (`data-returning`) pour que
 * l'entrée de l'accueil ne se rejoue pas. Doit rester minuscule : il bloque
 * le rendu.
 */
const THEME_BOOTSTRAP = `try{var d=document.documentElement,t=localStorage.getItem('theme');if(t==='dark'||t==='light')d.dataset.theme=t;if(sessionStorage.getItem('intro'))d.dataset.returning=''}catch(e){}`;

/** Couleur de fond de la page dans chaque thème, pour la barre du navigateur. */
const THEME_COLORS = { light: '#ecebe6', dark: '#1b2023' };

/**
 * Données structurées schema.org décrivant l'auteur du site.
 * @param {PageContext} ctx
 */
function personJsonLd({ site, t }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.author,
    url: site.baseUrl,
    image: site.baseUrl + site.portrait,
    jobTitle: t.meta.jobTitle,
    email: `mailto:${site.email}`,
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'IUT d’Aix-Marseille' },
    affiliation: { '@type': 'CollegeOrUniversity', name: 'Université de Technologie de Troyes' },
    sameAs: Object.values(site.social),
  };
  // `<` est neutralisé pour qu'aucune valeur ne puisse fermer la balise script.
  return raw(JSON.stringify(data).replace(/</g, '\\u003c'));
}

/**
 * @param {PageContext} ctx
 */
function head(ctx) {
  const { site, t, alternates } = ctx;
  const canonical = site.baseUrl + ctx.url;
  return html`<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${ctx.title}</title>
    <meta name="description" content="${ctx.description}" />
    <meta name="author" content="${site.author}" />
    <meta name="theme-color" content="${THEME_COLORS.light}" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="${THEME_COLORS.dark}" media="(prefers-color-scheme: dark)" />
    <link rel="canonical" href="${canonical}" />
    ${LANGUAGES.map((code) => html`<link rel="alternate" hreflang="${code}" href="${site.baseUrl + alternates[code]}" />`)}
    <link rel="alternate" hreflang="x-default" href="${site.baseUrl + alternates[LANGUAGES[0]]}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="${t.locale}" />
    <meta property="og:title" content="${ctx.title}" />
    <meta property="og:description" content="${ctx.description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${site.baseUrl + site.portrait}" />
    <meta name="twitter:card" content="summary" />
    <link rel="icon" type="image/png" href="/assets/img/favicon.png" />
    <link rel="preload" href="/assets/fonts/hanken-grotesk-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/assets/fonts/barlow-condensed-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="/css/style.css" />
    <script>${raw(THEME_BOOTSTRAP)}</script>
    <script type="application/ld+json">${personJsonLd(ctx)}</script>
    <script defer src="/js/site.js"></script>
    <script type="module" src="/js/map.js"></script>
  </head>`;
}

/**
 * En-tête collant, haut de 64 px : nom à gauche, ancres au centre, langue et
 * thème à droite. Sur mobile, les ancres passent sur une seconde ligne,
 * réparties sur toute la largeur pour que les quatre restent visibles, sans
 * menu à ouvrir ni JavaScript (la ligne défile encore en dernier recours sur
 * les écrans les plus étroits). Cibles tactiles de 44 px de haut.
 * @param {PageContext} ctx
 */
function header(ctx) {
  const { t, lang, alternates } = ctx;
  const home = route(lang, 'home');
  const other = LANGUAGES.find((code) => code !== lang);
  // En maintenance, les sections de l'accueil n'existent plus : pas de menu.
  const links = ctx.site.maintenance ? [] : ['projects', 'recruiters', 'clients', 'contact'];
  const control = 'grid h-11 min-w-11 place-items-center px-2 ring-1 ring-inset ring-hairline select-none transition-[color,box-shadow,transform] duration-150 ease-out hover:text-summit hover:ring-summit active:scale-[0.97]';

  return html`<header class="sticky top-0 z-10 border-b border-hairline bg-canvas-soft">
    <div class="page flex min-h-16 flex-wrap items-center gap-x-4 py-3 md:gap-x-6 md:py-0">
      <a href="${home}" class="name mr-auto text-[1.625rem] ${links.length > 0 ? 'md:mr-0' : ''}" translate="no">${ctx.site.author}</a>
      ${links.length > 0
        ? html`<nav aria-label="${t.nav.label}" class="order-last w-full overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:order-none md:mx-auto md:w-auto">
        <ul class="flex justify-between pt-1 max-md:[&>li:first-child>a]:pl-0 max-md:[&>li:last-child>a]:pr-0 text-[0.9375rem] text-ink max-[359px]:text-sm md:mx-0 md:justify-start md:gap-x-2 md:pt-0">
          ${links.map((id) => html`<li><a href="${home}#${id}" class="flex min-h-11 items-center whitespace-nowrap px-2 hover:text-summit max-[359px]:px-1 md:px-3">${t.nav[id]}</a></li>`)}
        </ul>
      </nav>`
        : ''}
      <div class="flex items-center gap-2">
        <a href="${alternates[other]}" hreflang="${other}" lang="${other}" aria-label="${t.nav.langSwitch}" class="${control} font-mono text-xs">${t.nav.langSwitchCode}</a>
        <button type="button" data-theme-toggle hidden aria-label="${t.nav.theme}" class="${control}">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" /><path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" /></svg>
        </button>
      </div>
    </div>
  </header>`;
}

/**
 * @param {PageContext} ctx
 */
function footer(ctx) {
  const { t, lang, site } = ctx;
  return html`<footer class="mono border-t border-hairline py-8">
    <div class="page flex flex-wrap gap-x-8 gap-y-2">
      <p class="mr-auto">© ${new Date().getFullYear()} <span translate="no">${site.author}</span>. ${t.footer.note}</p>
      <a href="${route(lang, 'legal')}" class="underline decoration-hairline underline-offset-4 hover:text-ink hover:decoration-ink">${t.footer.legal}</a>
    </div>
  </footer>`;
}

/**
 * Assemble une page complète.
 * @param {PageContext} ctx
 * @param {import('../lib/html.mjs').SafeHtml} content contenu de `<main>`
 * @returns {string} document HTML
 */
export function renderPage(ctx, content) {
  const page = html`<!doctype html>
<html lang="${ctx.lang}">
  ${head(ctx)}
  <body>
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:bg-canvas focus:px-4 focus:py-2">${ctx.t.nav.skip}</a>
    ${header(ctx)}
    <main id="main">${content}</main>
    ${footer(ctx)}
  </body>
</html>
`;
  return page.toString();
}
