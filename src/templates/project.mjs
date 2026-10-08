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
  return html`<div class="border-t border-hairline py-4">
    <dt class="mono">${label}</dt>
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
  return html`<section class="mt-12 first:mt-0">
    <h2 class="display-md mb-3">${title}</h2>
    ${content}
  </section>`;
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
  const paragraph = (text) => (text ? html`<p class="max-w-[40rem] leading-7">${text}</p>` : '');

  return html`<article>
    <div class="page pb-20 pt-12 sm:pt-16">
      <a href="${route(lang, 'home')}#projects" class="link text-sm">${labels.back}</a>

      <header class="mt-10">
        <p class="mono">${item.kicker}</p>
        <h1 class="display-xl mt-4 max-w-[20ch] sm:text-[3rem] lg:text-[3.5rem]">${item.title}</h1>
        <p class="lead mt-6">${item.summary}</p>
      </header>

      <div class="mt-16 grid gap-x-16 gap-y-12 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <dl class="border-b border-hairline lg:self-start">
          ${fact(labels.role, item.role)} ${fact(labels.period, item.period)}
          ${fact(labels.stack, shared.stack.join(', '), 'mono text-ink')}
        </dl>
        <div>
          ${block(labels.context, paragraph(item.context))} ${block(item.actionsLabel ?? labels.actions, bulletList(item.actions))}
          ${block(labels.outcome, paragraph(item.outcome))} ${block(labels.next, paragraph(item.next))}
          ${block(
            labels.links,
            shared.links.length > 0 &&
              html`<ul class="space-y-2">
                ${shared.links.map((link) => html`<li><a href="${link.url}" class="link">${t.projects.linkLabels[link.type]}</a></li>`)}
              </ul>`,
          )}
        </div>
      </div>
    </div>

    <aside class="border-t border-hairline py-16" aria-labelledby="others-title">
      <div class="page">
        <h2 id="others-title" class="display-md mb-10">${labels.others}</h2>
        ${projectMap(ctx, { label: labels.others, current: slug })}
      </div>
    </aside>
  </article>`;
}
