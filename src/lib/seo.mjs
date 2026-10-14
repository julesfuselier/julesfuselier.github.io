/**
 * Référencement : données structurées, plan du site et fichiers destinés aux
 * moteurs de réponse par IA (`llms.txt`).
 *
 * Tout est tiré des fichiers de contenu, comme les pages : un fait n'existe
 * qu'une fois, et ce que lisent les moteurs est exactement ce que lit un
 * visiteur. Aucune information n'est ajoutée ici.
 */

import { LANGUAGES } from './content.mjs';
import { route } from './routes.mjs';

/**
 * Identifiants schema.org stables : chaque page renvoie à la même personne et
 * au même site, ce qui permet aux moteurs de les relier entre elles.
 * @param {any} site
 */
function ids(site) {
  return { person: `${site.baseUrl}/#person`, website: `${site.baseUrl}/#website` };
}

/**
 * La personne derrière le site. Les compétences viennent de la section
 * recruteurs, dans la langue de la page.
 * @param {import('../templates/components.mjs').PageContext} ctx
 */
function person({ site, t }) {
  return {
    '@type': 'Person',
    '@id': ids(site).person,
    name: site.author,
    url: `${site.baseUrl}/`,
    image: site.baseUrl + site.portrait,
    jobTitle: t.meta.jobTitle,
    email: `mailto:${site.email}`,
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'IUT d’Aix-Marseille' },
    affiliation: { '@type': 'CollegeOrUniversity', name: 'Université de Technologie de Troyes' },
    knowsAbout: t.recruiters.skills.flatMap((group) => group.items),
    sameAs: Object.values(site.social),
  };
}

/**
 * Données structurées d'une page (JSON-LD), en un seul graphe : le site, la
 * personne, puis la page elle-même selon son type.
 *
 * - accueil : `ProfilePage` dont le sujet est la personne ;
 * - projet : `WebPage` décrivant un `CreativeWork` dont la personne est
 *   l'auteur, avec son fil d'Ariane ;
 * - autres pages : `WebPage` simple.
 * @param {import('../templates/components.mjs').PageContext} ctx
 * @returns {object}
 */
export function structuredData(ctx) {
  const { site, t, lang, kind, slug } = ctx;
  const { person: personId, website: websiteId } = ids(site);
  const url = site.baseUrl + ctx.url;
  const page = {
    '@type': kind === 'home' ? 'ProfilePage' : 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: ctx.title,
    description: ctx.description,
    inLanguage: lang,
    isPartOf: { '@id': websiteId },
  };
  const graph = [
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: `${site.baseUrl}/`,
      name: site.author,
      inLanguage: LANGUAGES,
      publisher: { '@id': personId },
    },
    person(ctx),
    page,
  ];

  if (kind === 'home') {
    page.mainEntity = { '@id': personId };
  }

  if (kind === 'project' && !site.maintenance) {
    const item = t.projects.items[slug];
    const shared = site.projects[slug];
    page.mainEntity = { '@id': `${url}#project` };
    page.breadcrumb = { '@id': `${url}#breadcrumb` };
    graph.push(
      {
        '@type': 'CreativeWork',
        '@id': `${url}#project`,
        name: item.title,
        alternateName: item.shortTitle,
        description: item.summary,
        url,
        inLanguage: lang,
        author: { '@id': personId },
        keywords: shared.stack.join(', '),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: site.author, item: site.baseUrl + route(lang, 'home') },
          { '@type': 'ListItem', position: 2, name: t.nav.projects, item: `${site.baseUrl}${route(lang, 'home')}#projects` },
          { '@type': 'ListItem', position: 3, name: item.shortTitle, item: url },
        ],
      },
    );
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

/**
 * Plan du site : chaque page avec ses équivalents dans les autres langues
 * (`hreflang`), pour que les moteurs servent la bonne langue, et sa date de
 * dernière modification.
 * @param {any} site
 * @param {{ url: string, alternates: Record<string, string> }[]} entries pages à indexer
 * @param {string} [lastmod] date de dernière modification (AAAA-MM-JJ)
 * @returns {string}
 */
export function sitemap(site, entries, lastmod) {
  const urls = entries.map(({ url, alternates }) => {
    const links = [
      ...LANGUAGES.map((lang) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${site.baseUrl + alternates[lang]}"/>\n`),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${site.baseUrl + alternates[LANGUAGES[0]]}"/>\n`,
    ].join('');
    return `  <url>\n    <loc>${site.baseUrl + url}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}${links}  </url>\n`;
  });
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    urls.join('') +
    '</urlset>\n'
  );
}

/**
 * Lien Markdown absolu vers une page du site.
 * @param {any} site
 * @param {string} label
 * @param {string} url adresse relative à la racine
 */
const link = (site, label, url) => `[${label}](${site.baseUrl + url})`;

/**
 * Deux-points selon la typographie de la langue (espace avant en français).
 * @param {string} lang
 */
const colon = (lang) => (lang === 'fr' ? ' : ' : ': ');

/**
 * Fiche d'un projet, en Markdown : utilisée en entier dans `llms-full.txt`.
 * @param {any} site
 * @param {any} t
 * @param {string} lang
 * @param {string} slug
 */
function projectMarkdown(site, t, lang, slug) {
  const item = t.projects.items[slug];
  const shared = site.projects[slug];
  const labels = t.projects.labels;
  const c = colon(lang);
  const lines = [
    `### ${item.title}`,
    '',
    item.summary,
    '',
    `- ${labels.stage}${c}${t.projects.stages[shared.stage]}`,
    ...(item.role ? [`- ${labels.role}${c}${item.role}`] : []),
    ...(item.period ? [`- ${labels.period}${c}${item.period}`] : []),
    `- ${labels.stack}${c}${shared.stack.join(', ')}`,
    `- Page${c}${site.baseUrl + route(lang, 'project', slug)}`,
    ...shared.links.map((l) => `- ${t.projects.linkLabels[l.type]}${c}${l.url.startsWith('/') ? site.baseUrl + l.url : l.url}`),
    '',
    `**${labels.context}.** ${item.context}`,
    '',
    `**${item.actionsLabel ?? labels.actions}.**`,
    '',
    ...item.actions.map((action) => `- ${action}`),
    '',
    `**${labels.outcome}.** ${item.outcome}`,
  ];
  if (item.next) lines.push('', `**${labels.next}.** ${item.next}`);
  return lines.join('\n');
}

/**
 * Présentation d'une langue : qui, quoi, comment joindre, et les projets.
 * @param {any} site
 * @param {any} t
 * @param {string} lang
 * @param {boolean} full avec le détail de chaque projet
 */
function languageSection(site, t, lang, full) {
  const c = colon(lang);
  const facts = t.hero.facts.map((fact) => `- ${fact.label}${c}${fact.value}`);
  const projects = site.projectOrder.map((slug) => {
    const item = t.projects.items[slug];
    return full
      ? projectMarkdown(site, t, lang, slug)
      : `- ${link(site, item.title, route(lang, 'project', slug))}${c}${item.summary} (${t.projects.stages[site.projects[slug].stage].toLowerCase()})`;
  });
  return [
    t.hero.lead,
    '',
    ...facts,
    '',
    `### ${t.recruiters.headline}`,
    '',
    t.recruiters.lead,
    '',
    ...t.recruiters.skills.map((group) => `- ${group.title}${c}${group.items.join(', ')}`),
    '',
    `### ${t.clients.headline}`,
    '',
    t.clients.lead,
    '',
    ...t.clients.services.map((service) => `- ${service.title}${c}${service.text}`),
    '',
    `### ${t.journey.headline}`,
    '',
    ...t.journey.items.map((item) => `- ${item.period}${c}${item.title}. ${item.text}`),
    '',
    `### ${t.projects.headline}`,
    '',
    t.projects.lead,
    '',
    ...(full ? projects.flatMap((p) => [p, '']) : [...projects, '']),
  ].join('\n');
}

/**
 * `llms.txt` (format proposé sur llmstxt.org) : un résumé du site en
 * Markdown, lisible par les assistants et moteurs de réponse par IA, avec
 * les liens vers chaque page. `full` donne `llms-full.txt`, où chaque projet
 * est détaillé en entier.
 * @param {any} site
 * @param {Record<string, any>} locales
 * @param {{ full?: boolean }} [options]
 * @returns {string}
 */
export function llmsTxt(site, locales, { full = false } = {}) {
  const [main] = LANGUAGES;
  const t = locales[main];
  const contact = [
    `- E-mail : ${site.email}`,
    `- ${link(site, t.recruiters.cvCta, site.cvPath)}`,
    ...Object.entries(site.social).map(([name, url]) => `- ${name === 'github' ? 'GitHub' : 'LinkedIn'} : ${url}`),
  ];
  const sections = LANGUAGES.map((lang) => {
    const tl = locales[lang];
    return [`## ${tl.meta.title} (${lang})`, '', `${link(site, tl.meta.title, route(lang, 'home'))}`, '', languageSection(site, tl, lang, full)].join('\n');
  });
  const others = LANGUAGES.flatMap((lang) => [
    `- ${link(site, locales[lang].legal.title, route(lang, 'legal'))}`,
  ]);
  return [
    `# ${site.author}`,
    '',
    `> ${t.meta.description}`,
    '',
    ...contact,
    ...(full ? [] : ['', `Version détaillée : ${site.baseUrl}/llms-full.txt`]),
    '',
    sections.join('\n'),
    '## Optional',
    '',
    ...others,
    '',
  ].join('\n');
}
