/**
 * Enveloppe commune à toutes les pages : `<head>`, en-tête, pied de page.
 */

import { html, raw } from '../lib/html.mjs';
import { LANGUAGES } from '../lib/content.mjs';
import { route } from '../lib/routes.mjs';

/** @typedef {import('./components.mjs').PageContext} PageContext */

/**
 * Applique le thème enregistré avant le premier affichage, pour éviter un
 * flash. Doit rester minuscule : il bloque le rendu.
 */
const THEME_BOOTSTRAP = `try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}`;

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
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${ctx.title}</title>
    <meta name="description" content="${ctx.description}" />
    <meta name="author" content="${site.author}" />
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
    <link rel="preload" href="/assets/fonts/space-grotesk-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="/css/style.css" />
    <script>${raw(THEME_BOOTSTRAP)}</script>
    <script type="application/ld+json">${personJsonLd(ctx)}</script>
    <script defer src="/js/site.js"></script>
  </head>`;
}

/**
 * En-tête : nom, navigation par ancres, langue et thème.
 * @param {PageContext} ctx
 */
function header(ctx) {
  const { t, lang, alternates } = ctx;
  const home = route(lang, 'home');
  const other = LANGUAGES.find((code) => code !== lang);
  const links = ['projects', 'recruiters', 'clients', 'journey', 'contact'];

  return html`<header class="sticky top-0 z-10 border-b border-line bg-paper">
    <div class="page flex flex-wrap items-center gap-x-8 gap-y-2 py-4">
      <a href="${home}" class="mr-auto text-lg font-semibold tracking-tight">${ctx.site.author}</a>
      <nav aria-label="${t.nav.label}" class="order-last w-full sm:order-none sm:w-auto">
        <ul class="flex gap-x-4 overflow-x-auto text-sm sm:gap-x-6 sm:text-[0.9375rem]">
          ${links.map((id) => html`<li><a href="${home}#${id}" class="whitespace-nowrap hover:underline hover:underline-offset-4">${t.nav[id]}</a></li>`)}
        </ul>
      </nav>
      <div class="flex items-center gap-4 text-[0.9375rem]">
        <a href="${alternates[other]}" hreflang="${other}" lang="${other}" aria-label="${t.nav.langSwitch}" class="font-mono hover:underline">${t.nav.langSwitchCode}</a>
        <button type="button" data-theme-toggle hidden aria-label="${t.nav.theme}" class="grid h-8 w-8 place-items-center rounded-sm border border-line hover:border-ink">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" /><path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" /></svg>
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
  return html`<footer class="border-t border-line py-8 text-sm text-muted">
    <div class="page flex flex-wrap gap-x-8 gap-y-2">
      <p class="mr-auto">© ${new Date().getFullYear()} ${site.author}. ${t.footer.note}</p>
      <a href="${route(lang, 'legal')}" class="hover:underline">${t.footer.legal}</a>
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
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:bg-paper focus:px-3 focus:py-2">${ctx.t.nav.skip}</a>
    ${header(ctx)}
    <main id="main">${content}</main>
    ${footer(ctx)}
  </body>
</html>
`;
  return page.toString();
}
