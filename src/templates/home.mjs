/**
 * Page d'accueil : ouverture et carte des projets, puis une section par
 * rubrique de la navigation (projets, recruteurs, entreprises, parcours,
 * contact).
 */

import { html } from '../lib/html.mjs';
import { route } from '../lib/routes.mjs';
import { bulletList, projectMap, sectionHeader } from './components.mjs';

/** @typedef {import('./components.mjs').PageContext} PageContext */

/** Nombre de projets mis en avant : ils occupent une rangée plus large. */
const FEATURED_PROJECTS = 2;

/**
 * Titre d'ouverture, découpé mot par mot pour l'animation d'entrée : chaque
 * mot monte à son tour (délai porté par `--i`).
 * @param {string} title
 */
function heroTitle(title) {
  let index = 0;
  return title
    .split(/( +)/)
    .filter(Boolean)
    .map((part) => (/^ +$/.test(part) ? part : html`<span class="hero-word" style="--i: ${index++}">${part}</span>`));
}

/**
 * Ouverture immersive : le relief des projets occupe toute la largeur de
 * l'écran, et la phrase d'accroche se pose sur son pied, avec les deux
 * actions principales (CV, contact). Sous la scène, un chemin par public
 * précise ce que chacun trouvera plus bas.
 *
 * Sur téléphone, le texte passe d'abord et la carte, carrée, vient ensuite :
 * l'ordre est réglé en CSS (`.hero-stage`).
 * @param {PageContext} ctx
 */
function hero(ctx) {
  const { site, t } = ctx;
  return html`<section class="hero-stage">
    <div class="hero-relief hero-in" style="--d: 250ms">${projectMap(ctx, { label: t.hero.mapLabel, legend: false })}</div>
    <div class="hero-copy page">
      <h1 class="display-xl max-w-[25ch]">${heroTitle(t.hero.title)}</h1>
      <p class="hero-in lead mt-6" style="--d: 600ms">${t.hero.lead}</p>
      <p class="hero-in mt-8 flex flex-wrap items-center gap-3" style="--d: 750ms">
        <a href="${site.cvPath}" class="btn-primary">${t.recruiters.cvCta}</a>
        <a href="mailto:${site.email}" class="btn-secondary">${t.clients.cta}</a>
      </p>
      <p class="hero-in meta mt-6 text-xs" style="--d: 900ms">${t.projects.mapLegend}</p>
    </div>
    ${heroPaths(ctx)}
  </section>`;
}

/**
 * Les deux chemins sous la scène : recruteur et entreprise, chacun avec ce
 * qu'il cherche et un lien vers sa section.
 * @param {PageContext} ctx
 */
function heroPaths(ctx) {
  const { t } = ctx;
  return html`<div class="hero-paths page hero-in" style="--d: 1000ms">
    <ul class="grid gap-8 sm:grid-cols-2">
      ${t.hero.paths.map(
        (path) => html`<li class="card">
          <h2 class="display-md">${path.title}</h2>
          <p class="mt-2 max-w-[34rem] leading-6 text-body">${path.text}</p>
          <p class="mt-4"><a href="${path.href}" class="link">${path.cta}</a></p>
        </li>`,
      )}
    </ul>
  </div>`;
}

/**
 * Carte de présentation d'un projet.
 * @param {PageContext} ctx
 * @param {string} slug
 * @param {string} titleClasses taille du titre, plus grande pour un projet mis en avant
 */
function projectCard(ctx, slug, titleClasses) {
  const { site, t, lang } = ctx;
  const item = t.projects.items[slug];
  const stack = site.projects[slug].stack;
  return html`<li class="flex">
    <a href="${route(lang, 'project', slug)}" class="card flex min-w-0 flex-1 flex-col">
      <p class="meta">${item.kicker}</p>
      <h3 class="${titleClasses} mt-3">${item.title}</h3>
      <p class="mb-6 mt-2 leading-6 text-body">${item.summary}</p>
      ${stack.length > 0 ? html`<p class="meta mt-auto">${stack.join(', ')}</p>` : ''}
    </a>
  </li>`;
}

/**
 * Projets : les deux missions professionnelles en grand, les autres en dessous.
 * @param {PageContext} ctx
 */
function projects(ctx) {
  const { site, t } = ctx;
  const featured = site.projectOrder.slice(0, FEATURED_PROJECTS);
  const others = site.projectOrder.slice(FEATURED_PROJECTS);
  return html`<section id="projects" class="border-t border-hairline py-20 sm:py-24" aria-labelledby="projects-title">
    <div class="page">
      ${sectionHeader({ id: 'projects', headline: t.projects.headline, lead: t.projects.lead })}
      <ul class="grid gap-6 md:grid-cols-2">
        ${featured.map((slug) => projectCard(ctx, slug, 'display-md sm:text-2xl'))}
      </ul>
      <ul class="mt-6 grid gap-6 md:grid-cols-3">
        ${others.map((slug) => projectCard(ctx, slug, 'display-md'))}
      </ul>
    </div>
  </section>`;
}

/**
 * Recruteurs : la recherche de stage, le CV, trois preuves liées aux projets
 * et le détail des compétences.
 * @param {PageContext} ctx
 */
function recruiters(ctx) {
  const { site, t, lang } = ctx;
  const r = t.recruiters;
  return html`<section id="recruiters" class="border-t border-hairline py-20 sm:py-24" aria-labelledby="recruiters-title">
    <div class="page">
      <div class="flex flex-wrap items-start gap-x-12 gap-y-8">
        <div class="min-w-0 flex-1 basis-[28rem]">
          ${sectionHeader({ id: 'recruiters', headline: r.headline, lead: r.lead })}
          <p class="-mt-4 flex flex-wrap gap-3">
            <a href="${site.cvPath}" class="btn-primary">${r.cvCta}</a>
            <a href="mailto:${site.email}" class="btn-secondary">${r.emailCta}</a>
          </p>
        </div>
        <img src="${site.portrait}" alt="${t.hero.portraitAlt}" width="160" height="160" loading="lazy" class="h-40 w-40 rounded-lg object-cover" />
      </div>

      <h3 class="display-md mb-6 mt-16">${r.proofsTitle}</h3>
      <ul class="grid gap-6 md:grid-cols-3">
        ${r.proofs.map(
          (proof) => html`<li class="flex">
            <a href="${route(lang, 'project', proof.project)}" class="card flex-1">
              <p class="meta">${t.projects.items[proof.project].shortTitle}</p>
              <p class="display-md mt-3">${proof.title}</p>
              <p class="mt-2 leading-6 text-body">${proof.text}</p>
            </a>
          </li>`,
        )}
      </ul>

      <h3 class="display-md mb-2 mt-16">${r.skillsTitle}</h3>
      <dl class="border-b border-hairline">
        ${r.skills.map(
          (group) => html`<div class="grid gap-x-8 gap-y-1 border-t border-hairline py-3 sm:grid-cols-[12rem_minmax(0,1fr)_minmax(0,1fr)]">
            <dt class="font-semibold">${group.title}</dt>
            <dd>${group.items.join(', ')}</dd>
            <dd class="meta sm:pt-0.5">${r.skillsProofLabel} : ${group.proof}</dd>
          </div>`,
        )}
      </dl>
    </div>
  </section>`;
}

/**
 * Entreprises : bandeau inversé, sur fond « forêt ». C'est la seule surface
 * sombre de la page en thème clair, ce qui sépare nettement les deux publics.
 * @param {PageContext} ctx
 */
function clients(ctx) {
  const { site, t } = ctx;
  const c = t.clients;
  return html`<section id="clients" class="bg-band py-20 text-band-ink sm:py-24" aria-labelledby="clients-title">
    <div class="page">
      ${sectionHeader({ id: 'clients', headline: c.headline, lead: c.lead, tone: 'band' })}
      <ul class="grid gap-8 md:grid-cols-3">
        ${c.services.map(
          (service) => html`<li class="border-t border-band-ink pt-4">
            <h3 class="display-md">${service.title}</h3>
            <p class="mt-2 leading-6 text-band-body">${service.text}</p>
          </li>`,
        )}
      </ul>
      ${clientCase(ctx)}
      <p class="mt-12">
        <a href="mailto:${site.email}" class="btn bg-band-ink text-band hover:opacity-85">${c.cta}</a>
      </p>
    </div>
  </section>`;
}

/**
 * Cas client : captures du site livré, sur ordinateur et sur téléphone, avec
 * un lien pour le vérifier soi-même.
 * @param {PageContext} ctx
 */
function clientCase(ctx) {
  const { site, t } = ctx;
  const c = t.clients.case;
  const url = site.projects['preity-india'].links.find((link) => link.type === 'site')?.url;
  return html`<figure class="mt-16 grid items-end gap-6 md:grid-cols-[minmax(0,1fr)_12rem]">
    <img src="/assets/img/projets/preity-india-accueil.webp" alt="${c.alt}" width="800" height="500" loading="lazy" class="w-full rounded-[5px]" />
    <img src="/assets/img/projets/preity-india-carte.webp" alt="${c.altMobile}" width="400" height="514" loading="lazy" class="hidden w-full rounded-[5px] md:block" />
    <figcaption class="md:col-span-2">
      <p class="font-semibold">${c.title}</p>
      <p class="mt-1 max-w-[40rem] leading-6 text-band-body">${c.text}</p>
      ${url ? html`<a href="${url}" class="mt-3 inline-block font-semibold underline decoration-2 underline-offset-4" rel="noopener">${c.link}</a>` : ''}
    </figcaption>
  </figure>`;
}

/**
 * Parcours : formation et expériences, du plus récent au plus ancien.
 * @param {PageContext} ctx
 */
function journey(ctx) {
  const { t } = ctx;
  return html`<section id="journey" class="py-20 sm:py-24" aria-labelledby="journey-title">
    <div class="page">
      ${sectionHeader({ id: 'journey', headline: t.journey.headline })}
      <ol class="border-b border-hairline">
        ${t.journey.items.map(
          (item) => html`<li class="grid gap-x-8 gap-y-1 border-t border-hairline py-4 sm:grid-cols-[14rem_minmax(0,1fr)]">
            <p class="meta sm:pt-0.5">${item.period}</p>
            <div>
              <h3 class="font-medium">${item.title}</h3>
              <p class="text-body">${item.text}</p>
            </div>
          </li>`,
        )}
      </ol>
    </div>
  </section>`;
}

/**
 * @param {PageContext} ctx
 */
function contact(ctx) {
  const { site, t } = ctx;
  return html`<section id="contact" class="border-t border-hairline py-20 sm:py-24" aria-labelledby="contact-title">
    <div class="page">
      ${sectionHeader({ id: 'contact', headline: t.contact.headline })}
      <p class="flex flex-wrap items-center gap-3">
        <a href="mailto:${site.email}" class="btn-primary max-w-full"><span class="truncate" translate="no">${site.email}</span></a>
        <a href="${site.social.linkedin}" rel="me noopener" class="btn-secondary" translate="no">${t.contact.linkedin}</a>
        <a href="${site.social.github}" rel="me noopener" class="btn-secondary" translate="no">${t.contact.github}</a>
      </p>
    </div>
  </section>`;
}

/**
 * @param {PageContext} ctx
 * @returns {import('../lib/html.mjs').SafeHtml}
 */
export function homePage(ctx) {
  return html`${hero(ctx)}${projects(ctx)}${recruiters(ctx)}${clients(ctx)}${journey(ctx)}${contact(ctx)}`;
}
