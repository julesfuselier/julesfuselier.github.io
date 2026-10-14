/**
 * Page d'accueil : l'en-tête avec le randonneur, puis une section par
 * rubrique de la navigation (projets, recruteurs, entreprises, contact), et
 * une courte section personnelle avant le contact.
 */

import { html } from '../lib/html.mjs';
import { route } from '../lib/routes.mjs';
import { button, projectMap, sectionHeader, stageMark } from './components.mjs';

/** @typedef {import('./components.mjs').PageContext} PageContext */

/** Images fixes du randonneur, une par thème, affichées tant que la 3D n'a pas pris le relais. */
export const HIKER_POSTERS = { dark: '/assets/img/hiker-dark.webp', light: '/assets/img/hiker-light.webp' };

/**
 * Titre d'ouverture, découpé mot par mot pour l'animation d'entrée : chaque
 * mot monte à son tour (délai porté par `--i`). Le passage entre accolades
 * dans le texte (`{…}`) est souligné d'un trait de sentier qui se dessine.
 * La ponctuation qui suit le passage lui reste collée, pour ne jamais passer
 * seule à la ligne.
 * @param {string} title
 */
function heroTitle(title) {
  const [before, rawAccent = '', rawAfter = ''] = title.split(/[{}]/);
  const punctuation = rawAfter.match(/^[^\s\p{L}\p{N}]+/u)?.[0] ?? '';
  const accent = rawAccent + punctuation;
  const after = rawAfter.slice(punctuation.length);
  let index = 0;
  const words = (text) => text.split(/(\s+)/).filter(Boolean).map((part) => (/^\s+$/.test(part) ? part : html`<span class="hero-word" style="--i: ${index++}">${part}</span>`));
  return html`${words(before)}${accent ? html`<span class="hero-accent">${words(accent)}<svg class="hero-accent-trail" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path d="M1 6 C 20 2, 35 9, 55 5 S 85 3, 99 6" /></svg></span>` : ''}${words(after)}`;
}

/**
 * Grand bouton d'en-tête, un par public : nom court en capitales, une ligne
 * d'explication et une case flèche. Le balisage le remplit au survol.
 * @param {string} href
 * @param {{ title: string, text: string }} cta
 * @param {'cta-filled' | 'cta-outline'} tone classe écrite en entier, pour que Tailwind la conserve
 */
function heroCta(href, cta, tone) {
  return html`<a href="${href}" class="cta ${tone}">
    <span class="cta-text"><span class="name text-[2rem] sm:text-[2.25rem]">${cta.title}</span><span class="cta-sub">${cta.text}</span></span>
    <span class="cta-arrow" aria-hidden="true">
      <svg class="cta-arrow-out" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
      <svg class="cta-arrow-in" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
    </span>
  </a>`;
}

/**
 * Ouverture : la phrase d'accroche, le chapeau et les disponibilités à
 * gauche, le randonneur 3D à droite, puis une action par public.
 * @param {PageContext} ctx
 */
function hero(ctx) {
  const { t } = ctx;
  return html`<section class="page pb-20 pt-12 sm:pt-20">
    <div class="grid items-center gap-x-12 gap-y-6 min-[900px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div class="min-w-0">
        <h1 class="display-xl max-w-[20ch]">${heroTitle(t.hero.title)}</h1>
        <p class="hero-in lead mt-9" style="--d: 450ms">${t.hero.lead}</p>
        <dl class="hero-in mono mt-7 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5" style="--d: 520ms">
          ${t.hero.facts.map((fact) => html`<dt>${fact.label}</dt><dd class="text-ink">${fact.value}</dd>`)}
        </dl>
      </div>
      <figure class="hiker hero-in" style="--d: 200ms" data-hiker aria-hidden="true">
        <img class="hiker-poster hiker-poster-dark" src="${HIKER_POSTERS.dark}" alt="" width="960" height="720" decoding="async" fetchpriority="high" />
        <img class="hiker-poster hiker-poster-light" src="${HIKER_POSTERS.light}" alt="" width="960" height="720" decoding="async" />
      </figure>
    </div>
    <div class="hero-in mt-10 grid gap-4 sm:grid-cols-2" style="--d: 600ms">
      ${heroCta('#recruiters', t.hero.ctas.recruiters, 'cta-filled')} ${heroCta('#clients', t.hero.ctas.clients, 'cta-outline')}
    </div>
  </section>`;
}

/**
 * Ligne de la liste des projets : nom et type, une phrase, étape atteinte.
 * @param {PageContext} ctx
 * @param {string} slug
 */
function projectRow(ctx, slug) {
  const { site, t, lang } = ctx;
  const item = t.projects.items[slug];
  const { years, stage } = site.projects[slug];
  return html`<li>
    <a href="${route(lang, 'project', slug)}" class="project-row group">
      <span class="flex min-w-0 flex-col gap-1">
        <span class="name text-[1.75rem] group-hover:text-summit sm:text-[2rem]">${item.shortTitle}</span>
        <span class="mono">${item.kicker}${years ? html`, ${years}` : ''}</span>
      </span>
      <span class="leading-relaxed text-body">${item.summary}</span>
      <span class="mono flex items-center gap-2 text-ink" data-stage="${stage}">${stageMark(stage)}${t.projects.stages[stage]}</span>
    </a>
  </li>`;
}

/**
 * Projets : la carte sert d'index, la liste en dessous dit l'étape atteinte
 * par chacun. Chaque projet n'apparaît qu'à ces deux endroits.
 * @param {PageContext} ctx
 */
function projects(ctx) {
  const { site, t } = ctx;
  return html`<section id="projects" class="border-t border-hairline py-20 sm:py-24" aria-labelledby="projects-title">
    <div class="page">
      ${sectionHeader({ id: 'projects', eyebrow: t.nav.projects, headline: t.projects.headline, lead: t.projects.lead })}
      ${projectMap(ctx, { label: t.hero.mapLabel })}
      <ul class="mt-12 border-b border-hairline">
        ${site.projectOrder.map((slug) => projectRow(ctx, slug))}
      </ul>
    </div>
  </section>`;
}

/**
 * Recruteurs : la recherche de stage et le CV, puis les compétences et le
 * parcours côte à côte. Le parcours vit ici : c'est le recruteur qui le lit.
 * @param {PageContext} ctx
 */
function recruiters(ctx) {
  const { site, t } = ctx;
  const r = t.recruiters;
  const row = 'grid gap-x-6 gap-y-1 border-t border-hairline py-3.5 sm:grid-cols-[9.5rem_minmax(0,1fr)]';
  return html`<section id="recruiters" class="border-t border-hairline py-20 sm:py-24" aria-labelledby="recruiters-title">
    <div class="page">
      <div class="flex flex-wrap items-start gap-x-12 gap-y-8">
        <div class="min-w-0 flex-1 basis-[30rem]">
          ${sectionHeader({ id: 'recruiters', eyebrow: t.nav.recruiters, headline: r.headline, lead: r.lead })}
          <p class="-mt-4 flex flex-wrap gap-3">
            ${button({ href: site.cvPath, label: r.cvCta, variant: 'primary', icon: 'download' })}
            ${button({ href: `mailto:${site.email}`, label: r.emailCta })}
          </p>
        </div>
        <img src="${site.portrait}" alt="${t.hero.portraitAlt}" width="176" height="208" loading="lazy" class="h-52 w-44 object-cover ring-1 ring-hairline" />
      </div>

      <div class="mt-20 grid gap-x-16 gap-y-14 lg:grid-cols-2">
        <div>
          <h3 class="name mb-4 text-[1.75rem]">${r.skillsTitle}</h3>
          <dl class="border-b border-hairline">
            ${r.skills.map((group) => html`<div class="${row}"><dt class="font-semibold">${group.title}</dt><dd class="text-body">${group.items.join(', ')}</dd></div>`)}
          </dl>
        </div>
        <div>
          <h3 class="name mb-4 text-[1.75rem]">${t.nav.journey}</h3>
          <ol class="border-b border-hairline">
            ${t.journey.items.map(
              (item) => html`<li class="${row}">
                <p class="mono pt-0.5">${item.period}</p>
                <p><span class="font-semibold">${item.title}</span><span class="block text-body">${item.text}</span></p>
              </li>`,
            )}
          </ol>
        </div>
      </div>
    </div>
  </section>`;
}

/**
 * Entreprises : les trois offres de la micro-entreprise et un appel à écrire.
 * @param {PageContext} ctx
 */
function clients(ctx) {
  const { site, t } = ctx;
  const c = t.clients;
  return html`<section id="clients" class="border-t border-hairline py-20 sm:py-24" aria-labelledby="clients-title">
    <div class="page">
      ${sectionHeader({ id: 'clients', eyebrow: t.nav.clients, headline: c.headline, lead: c.lead })}
      <ul class="grid gap-8 md:grid-cols-3">
        ${c.services.map(
          (service) => html`<li class="border-t-2 border-ink pt-4">
            <h3 class="name text-[1.75rem]">${service.title}</h3>
            <p class="mt-2.5 leading-relaxed text-body">${service.text}</p>
          </li>`,
        )}
      </ul>
      <p class="mt-12">${button({ href: `mailto:${site.email}`, label: c.cta })}</p>
    </div>
  </section>`;
}

/**
 * Hors carte : quelques lignes personnelles, qui expliquent d'où vient la
 * carte du site.
 * @param {PageContext} ctx
 */
function offMap(ctx) {
  const { t } = ctx;
  return html`<section class="border-t border-hairline py-16 sm:py-20" aria-labelledby="off-map-title">
    <div class="page flex flex-wrap items-baseline gap-x-16 gap-y-4">
      <h2 id="off-map-title" class="name text-[1.75rem]">${t.offMap.title}</h2>
      <p class="lead max-w-[36rem] flex-1 basis-[24rem] text-xl text-ink">${t.offMap.text}</p>
    </div>
  </section>`;
}

/**
 * @param {PageContext} ctx
 */
function contact(ctx) {
  const { site, t } = ctx;
  return html`<section id="contact" class="border-t border-hairline py-20 sm:py-28" aria-labelledby="contact-title">
    <div class="page">
      <p class="mono mb-4">${t.nav.contact}</p>
      <h2 id="contact-title" class="display-xl max-w-[16ch]">${t.contact.headline}</h2>
      <p class="mt-10 flex flex-wrap items-center gap-3">
        ${button({ href: `mailto:${site.email}`, label: html`<span class="truncate" translate="no">${site.email}</span>`, variant: 'primary', extra: 'max-w-full' })}
        <a href="${site.social.linkedin}" rel="me noopener" class="btn-plain" translate="no">${t.contact.linkedin}</a>
        <a href="${site.social.github}" rel="me noopener" class="btn-plain" translate="no">${t.contact.github}</a>
      </p>
    </div>
  </section>`;
}

/**
 * @param {PageContext} ctx
 * @returns {import('../lib/html.mjs').SafeHtml}
 */
export function homePage(ctx) {
  return html`${hero(ctx)}${projects(ctx)}${recruiters(ctx)}${clients(ctx)}${offMap(ctx)}${contact(ctx)}`;
}
