/**
 * Chargement et validation du contenu.
 *
 * Le contenu vit dans `src/content/` :
 *  - `site.json` : données indépendantes de la langue (liens, technologies) ;
 *  - `fr.json`, `en.json` : textes, avec exactement la même structure.
 *
 * `validateContent` est utilisé par la compilation et par les tests : une
 * traduction oubliée ou un projet incomplet fait échouer les deux.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { typesetDeep } from './typography.mjs';

/** Langues publiées. La première est la langue par défaut (racine du site). */
export const LANGUAGES = ['fr', 'en'];

const CONTENT_DIR = new URL('../content/', import.meta.url);

/** Champs texte obligatoires d'un projet, dans chaque langue. */
const REQUIRED_PROJECT_FIELDS = ['title', 'kicker', 'summary', 'context', 'role', 'actions', 'outcome'];

/** Types de liens de projet reconnus (libellés dans `projects.linkLabels`). */
const LINK_TYPES = ['site', 'github', 'install', 'demo'];

/**
 * @param {string} name nom du fichier dans `src/content/`
 * @returns {Promise<any>}
 */
async function readJson(name) {
  const path = fileURLToPath(new URL(name, CONTENT_DIR));
  return JSON.parse(await readFile(path, 'utf8'));
}

/**
 * Charge tout le contenu du site.
 * @returns {Promise<{ site: any, locales: Record<string, any> }>}
 */
export async function loadContent() {
  const site = await readJson('site.json');
  // Les textes passent par la correction typographique ; `site.json` (adresses,
  // identifiants) reste tel quel.
  const entries = await Promise.all(LANGUAGES.map(async (lang) => [lang, typesetDeep(lang, await readJson(`${lang}.json`))]));
  return { site, locales: Object.fromEntries(entries) };
}

/**
 * Décrit la forme d'une valeur : mêmes clés et mêmes longueurs de tableaux
 * donnent la même description. Les valeurs elles-mêmes sont ignorées.
 * @param {unknown} value
 * @returns {unknown}
 */
function shapeOf(value) {
  if (Array.isArray(value)) return value.map(shapeOf);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, shapeOf(value[key])]),
    );
  }
  return value === null ? 'null' : 'value';
}

/**
 * Liste les différences de structure entre deux contenus.
 * @param {unknown} reference
 * @param {unknown} candidate
 * @param {string} path
 * @returns {string[]}
 */
function shapeDifferences(reference, candidate, path = '') {
  if (typeof reference !== typeof candidate || Array.isArray(reference) !== Array.isArray(candidate)) {
    return [`${path || '(racine)'} : type différent`];
  }
  if (Array.isArray(reference)) {
    if (reference.length !== candidate.length) return [`${path} : ${reference.length} éléments contre ${candidate.length}`];
    return reference.flatMap((item, index) => shapeDifferences(item, candidate[index], `${path}[${index}]`));
  }
  if (reference !== null && typeof reference === 'object') {
    const keys = new Set([...Object.keys(reference), ...Object.keys(candidate)]);
    return [...keys].flatMap((key) => {
      const next = path ? `${path}.${key}` : key;
      if (!(key in reference) || !(key in candidate)) return [`${next} : clé absente d'une des langues`];
      return shapeDifferences(reference[key], candidate[key], next);
    });
  }
  return reference === candidate ? [] : [`${path} : null dans une seule langue`];
}

/**
 * Vérifie la cohérence du contenu.
 * @param {{ site: any, locales: Record<string, any> }} content
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateContent({ site, locales }) {
  const errors = [];
  const warnings = [];
  const [reference, ...others] = LANGUAGES;

  for (const lang of others) {
    const differences = shapeDifferences(shapeOf(locales[reference]), shapeOf(locales[lang]));
    errors.push(...differences.map((difference) => `${reference}/${lang} : ${difference}`));
  }

  const declared = Object.keys(site.projects).sort();
  const ordered = [...site.projectOrder].sort();
  if (JSON.stringify(declared) !== JSON.stringify(ordered)) {
    errors.push('site.json : projectOrder et projects ne listent pas les mêmes projets');
  }

  for (const slug of site.projectOrder) {
    const shared = site.projects[slug] ?? { stack: [], links: [] };
    for (const link of shared.links) {
      if (!LINK_TYPES.includes(link.type)) errors.push(`${slug} : type de lien inconnu « ${link.type} »`);
    }
    if (shared.stack.length === 0) warnings.push(`${slug} : aucune technologie renseignée (site.json)`);

    for (const lang of LANGUAGES) {
      const texts = locales[lang].projects.items[slug];
      if (!texts) {
        errors.push(`${lang} : textes manquants pour le projet « ${slug} »`);
        continue;
      }
      for (const field of REQUIRED_PROJECT_FIELDS) {
        const value = texts[field];
        if (value === null || value === undefined || value.length === 0) errors.push(`${lang}.${slug}.${field} : champ vide`);
      }
    }
  }

  for (const lang of LANGUAGES) {
    for (const proof of locales[lang].recruiters.proofs) {
      if (!site.projects[proof.project]) errors.push(`${lang} : preuve liée à un projet inconnu « ${proof.project} »`);
    }
  }

  if (!site.publisher.siret) warnings.push('site.json : SIRET non renseigné, les mentions légales sont incomplètes');
  return { errors, warnings };
}
