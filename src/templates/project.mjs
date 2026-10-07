/**
 * Page d'étude de cas d'un projet.
 */

import { html } from '../lib/html.mjs';
import { route } from '../lib/routes.mjs';
import { bulletList, projectMap } from './components.mjs';

/** @typedef {import('./components.mjs').PageContext} PageContext */

/**
 * Ligne de la fiche d'identité du projet. Rien n'est affiché si la valeur
 * manque : un champ non renseigné ne laisse pas de libellé orphelin.
 * @param {string} label
 * @param {string | null | undefined} value
 * @param {string} [valueClasses]
 */
function fact(label, value, valueClasses = '') {
  if (!value) return '';
  return html`<div class="border-t border-line py-3">
    <dt class="text-sm text-muted">${label}</dt>
    <dd class="mt-1 ${valueClasses}">${value}</dd>
  </div>`;
}

/**
 * Bloc titré du corps de l'étude de cas, omis si le contenu est vide.
 * @param {string} title
 * @param {unknown} content
 */
function block(title, content) {
  if (!content) return '';
  return html`<section class="mt-10">
    <h2 class="subheading text-xl">${title}</h2>
    ${content}
  </section>`;
}

/**
 * Liens vers le projet précédent et le suivant, dans l'ordre de `projectOrder`.
 * @param {PageContext} ctx
 * @param {string} slug
 */
function siblings(ctx, slug) {
  const { site, t, lang } = ctx;
  const order = site.projectOrder;
  const index = order.indexOf(slug);
  const previous = order[index - 1];
  const following = order[index + 1];
  const link = (target, label, classes) =>
    target
      ? html`<a href="${route(lang, 'project', target)}" class="${classes}">
          <span class="block text-sm text-muted">${label}</span>
          <span class="link">${t.projects.items[target].shortTitle}</span>
        </a>`
      : html`<span></span>`;

  return html`<nav aria-label="${t.projects.title}" class="mt-16 flex justify-between gap-8 border-t border-line pt-6">
    ${link(previous, t.projects.labels.previous, '')} ${link(following, t.projects.labels.following, 'text-right')}
  </nav>`;
}

/**
 * @param {PageContext} ctx
 * @param {string} slug identifiant du projet
 * @returns {import('../lib/html.mjs').SafeHtml}
 */
export function projectPage(ctx, slug) {
  const { site, t, lang } = ctx;
  const item = t.projects.items[slug];
  const shared = site.projects[slug];
  const labels = t.projects.labels;
  const paragraph = (text) => (text ? html`<p class="max-w-[38rem] leading-relaxed">${text}</p>` : '');

  return html`<article class="page py-12 sm:py-16">
    <a href="${route(lang, 'home')}#projects" class="link text-sm">${labels.back}</a>

    <header class="mt-8 grid items-end gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div>
        <p class="text-muted">${item.kicker}</p>
        <h1 class="mt-3 max-w-[22ch] text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">${item.title}</h1>
        <p class="lead mt-6">${item.summary}</p>
      </div>
      ${projectMap(ctx, { label: t.projects.title, current: slug })}
    </header>

    <div class="legend-grid mt-12">
      <dl class="border-b border-line lg:self-start">
        ${fact(labels.role, item.role)} ${fact(labels.period, item.period)}
        ${fact(labels.stack, shared.stack.join(', '), 'font-mono text-[0.8125rem]')}
      </dl>
      <div>
        <section>
          <h2 class="subheading text-xl">${labels.context}</h2>
          ${paragraph(item.context)}
        </section>
        ${block(labels.actions, bulletList(item.actions))} ${block(labels.outcome, paragraph(item.outcome))}
        ${block(labels.next, paragraph(item.next))}
        ${block(
          labels.links,
          shared.links.length > 0 &&
            html`<ul class="space-y-2">
              ${shared.links.map((link) => html`<li><a href="${link.url}" class="link">${t.projects.linkLabels[link.type]}</a></li>`)}
            </ul>`,
        )}
      </div>
    </div>

    ${siblings(ctx, slug)}
  </article>`;
}
