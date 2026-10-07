/**
 * Page d'accueil : carte des projets, liste des projets, puis une section par
 * public (recruteurs, entreprises), le parcours et le contact.
 */

import { html } from '../lib/html.mjs';
import { route } from '../lib/routes.mjs';
import { bulletList, datumList, projectMap, section } from './components.mjs';

/** @typedef {import('./components.mjs').PageContext} PageContext */

/**
 * Ouverture : qui je suis, l'action principale (le CV), la carte des projets
 * et une entrée par public.
 * @param {PageContext} ctx
 */
function hero(ctx) {
  const { site, t } = ctx;
  return html`<section class="page grid items-center gap-x-12 gap-y-10 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
    <div>
      <p class="mb-5 text-muted">${t.hero.intro}</p>
      <h1 class="max-w-[20ch] text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">${t.hero.title}</h1>
      <p class="lead mt-6">${t.hero.lead}</p>
      <p class="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
        <a href="${site.cvPath}" class="btn">${t.recruiters.cvCta}</a>
        <a href="mailto:${site.email}" class="link">${t.hero.emailCta}</a>
      </p>
      <div class="mt-10 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
        ${t.hero.paths.map(
          (path) => html`<div>
            <h2 class="font-semibold">${path.title}</h2>
            <p class="mt-2 leading-relaxed text-muted">${path.text}</p>
            <a href="#${path.audience}" class="link mt-3 inline-block">${path.cta}</a>
          </div>`,
        )}
      </div>
    </div>
    ${projectMap(ctx, { label: t.hero.mapLabel, classes: 'w-full' })}
  </section>`;
}

/**
 * Liste des projets : une ligne par projet, sans vignette.
 * @param {PageContext} ctx
 */
function projects(ctx) {
  const { site, t, lang } = ctx;
  const body = html`<p class="lead mb-10">${t.projects.lead}</p>
    <ul class="border-b border-line">
      ${site.projectOrder.map((slug) => {
        const item = t.projects.items[slug];
        return html`<li class="grid gap-x-8 gap-y-2 border-t border-line py-7 md:grid-cols-[minmax(0,1fr)_14rem]">
          <div>
            <h3 class="text-xl font-semibold tracking-tight">
              <a href="${route(lang, 'project', slug)}" class="hover:underline hover:underline-offset-4">${item.title}</a>
            </h3>
            <p class="mt-2 max-w-[38rem] leading-relaxed text-muted">${item.summary}</p>
          </div>
          <div class="space-y-2 md:pt-1">
            <p class="text-sm">${item.kicker}</p>
            ${datumList(site.projects[slug].stack)}
          </div>
        </li>`;
      })}
    </ul>`;
  return section({ id: 'projects', title: t.projects.title, body });
}

/**
 * Section destinée aux recruteurs : recherche de stage, preuves, compétences.
 * @param {PageContext} ctx
 */
function recruiters(ctx) {
  const { site, t, lang } = ctx;
  const r = t.recruiters;
  const body = html`<div class="flex flex-wrap items-start gap-x-10 gap-y-6">
      <img src="${site.portrait}" alt="${t.hero.portraitAlt}" width="112" height="112" loading="lazy" class="h-28 w-28 rounded-sm object-cover" />
      <div class="min-w-0 flex-1 basis-80">
        <p class="max-w-[30rem] text-2xl font-medium leading-snug tracking-tight">${r.lead}</p>
        <a href="${site.cvPath}" class="link mt-4 inline-block">${r.cvCta}</a>
      </div>
    </div>

    <div class="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
      <div>
        <h3 class="subheading">${r.seekingTitle}</h3>
        ${bulletList(r.seeking)}
      </div>
      <div>
        <h3 class="subheading">${r.proofsTitle}</h3>
        <ul class="space-y-4">
          ${r.proofs.map(
            (proof) => html`<li>
              <a href="${route(lang, 'project', proof.project)}" class="link">${proof.title}</a>
              <p class="mt-1 leading-relaxed text-muted">${proof.text}</p>
            </li>`,
          )}
        </ul>
      </div>
    </div>

    <h3 class="subheading mt-12">${r.skillsTitle}</h3>
    <dl class="border-b border-line">
      ${r.skills.map(
        (group) => html`<div class="grid gap-x-8 gap-y-1 border-t border-line py-3 sm:grid-cols-[12rem_minmax(0,1fr)]">
          <dt class="font-medium">${group.title}</dt>
          <dd class="datum">${group.items.join(', ')}</dd>
        </div>`,
      )}
    </dl>`;
  return section({ id: 'recruiters', title: r.title, body });
}

/**
 * Section destinée aux clients de la micro-entreprise, sur fond « forêt »
 * pour la distinguer nettement de la section recruteurs.
 * @param {PageContext} ctx
 */
function clients(ctx) {
  const { site, t } = ctx;
  const c = t.clients;
  const body = html`<p class="max-w-[34rem] text-2xl font-medium leading-snug tracking-tight">${c.lead}</p>

    <h3 class="subheading mt-12">${c.servicesTitle}</h3>
    <ul class="grid gap-x-10 gap-y-8 md:grid-cols-3">
      ${c.services.map(
        (service) => html`<li class="border-t border-band-line pt-4">
          <h4 class="font-semibold">${service.title}</h4>
          <p class="mt-2 leading-relaxed text-band-muted">${service.text}</p>
        </li>`,
      )}
    </ul>

    <p class="mt-12 text-band-muted">${c.note}</p>
    <a href="mailto:${site.email}" class="mt-4 inline-block rounded-sm bg-band-ink px-5 py-3 font-medium text-band hover:opacity-90">${c.cta}</a>`;
  return section({ id: 'clients', title: c.title, body, classes: 'bg-band text-band-ink' });
}

/**
 * Parcours : formation et expériences, du plus récent au plus ancien.
 * @param {PageContext} ctx
 */
function journey(ctx) {
  const { t } = ctx;
  const body = html`<ol class="border-b border-line">
    ${t.journey.items.map(
      (item) => html`<li class="grid gap-x-8 gap-y-1 border-t border-line py-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
        <p class="datum sm:pt-0.5">${item.period}</p>
        <div>
          <h3 class="font-semibold">${item.title}</h3>
          <p class="text-muted">${item.text}</p>
        </div>
      </li>`,
    )}
  </ol>`;
  return section({ id: 'journey', title: t.journey.title, body });
}

/**
 * @param {PageContext} ctx
 */
function contact(ctx) {
  const { site, t } = ctx;
  const body = html`<p class="lead">${t.contact.text}</p>
    <p class="mt-6">
      <a href="mailto:${site.email}" class="break-all text-2xl font-medium tracking-tight underline decoration-line decoration-2 underline-offset-8 hover:decoration-ink sm:text-3xl">${site.email}</a>
    </p>
    <ul class="mt-8 flex gap-8">
      <li><a href="${site.social.linkedin}" rel="me noopener" class="link">${t.contact.linkedin}</a></li>
      <li><a href="${site.social.github}" rel="me noopener" class="link">${t.contact.github}</a></li>
    </ul>`;
  return section({ id: 'contact', title: t.contact.title, body });
}

/**
 * @param {PageContext} ctx
 * @returns {import('../lib/html.mjs').SafeHtml}
 */
export function homePage(ctx) {
  return html`${hero(ctx)}${projects(ctx)}${recruiters(ctx)}${clients(ctx)}${journey(ctx)}${contact(ctx)}`;
}
