/**
 * Compilation du site.
 *
 *   node scripts/build.mjs
 *
 * Le site est publié par GitHub Pages depuis la racine du dépôt : les pages
 * générées y sont donc écrites directement et versionnées. Les sources sont
 * dans `src/` ; tout ce que ce script écrit ne doit pas être modifié à la main.
 *
 * Étapes : validation du contenu, pages HTML (une par langue), cartes
 * topographiques, polices, script, feuille de style, plan du site.
 */

import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { LANGUAGES, loadContent, validateContent } from '../src/lib/content.mjs';
import { createContourMap } from '../src/lib/contours.mjs';
import { GENERATED_DIRS, outputFile, route } from '../src/lib/routes.mjs';
import { HOME_MAP, homePage } from '../src/templates/home.mjs';
import { renderPage } from '../src/templates/layout.mjs';
import { projectPage } from '../src/templates/project.mjs';
import { legalPage, notFoundPage } from '../src/templates/simple.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** Polices copiées depuis `node_modules` vers `assets/fonts/`. */
const FONTS = [
  '@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2',
  '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
];

/** Anciennes adresses du site, redirigées vers la liste des projets. */
const LEGACY_PAGES = ['projects.html', 'project-detail.html'];

/**
 * Écrit un fichier en créant ses dossiers parents.
 * @param {string} outDir
 * @param {string} file chemin relatif à `outDir`
 * @param {string} content
 */
async function write(outDir, file, content) {
  const path = join(outDir, file);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
}

/**
 * Calcule toutes les pages du site.
 * @param {{ site: any, locales: Record<string, any> }} content
 * @returns {{ pages: Record<string, string>, assets: Record<string, string> }}
 *   fichiers à écrire : chemin relatif → contenu
 */
export function renderSite({ site, locales }) {
  const pages = {};
  const assets = {};

  // Cartes topographiques : une pour l'accueil (un sommet par projet), une par projet.
  const homePeaks = site.projectOrder.map((slug) => {
    const { x, y } = site.projects[slug].summit;
    return { x: x / 100, y: y / 100 };
  });
  assets[`assets/contours/${HOME_MAP}.svg`] = createContourMap({
    seed: HOME_MAP,
    peaks: homePeaks,
    width: 900,
    height: 720,
    levels: 13,
  }).svg;

  const summits = {};
  for (const slug of site.projectOrder) {
    const map = createContourMap({ seed: slug });
    assets[`assets/contours/${slug}.svg`] = map.svg;
    [summits[slug]] = map.summits;
  }

  /** Adresse d'une même page dans toutes les langues. */
  const alternatesFor = (kind, slug) => Object.fromEntries(LANGUAGES.map((lang) => [lang, route(lang, kind, slug)]));

  for (const lang of LANGUAGES) {
    const t = locales[lang];
    const base = { lang, t, site };

    const home = { ...base, url: route(lang, 'home'), alternates: alternatesFor('home'), title: t.meta.title, description: t.meta.description };
    pages[outputFile(home.url)] = renderPage(home, homePage(home));

    for (const slug of site.projectOrder) {
      const item = t.projects.items[slug];
      const ctx = {
        ...base,
        url: route(lang, 'project', slug),
        alternates: alternatesFor('project', slug),
        title: `${item.title} | ${site.author}`,
        description: item.summary,
      };
      pages[outputFile(ctx.url)] = renderPage(ctx, projectPage(ctx, slug, summits[slug]));
    }

    const legal = {
      ...base,
      url: route(lang, 'legal'),
      alternates: alternatesFor('legal'),
      title: `${t.legal.title} | ${site.author}`,
      description: t.legal.title,
    };
    pages[outputFile(legal.url)] = renderPage(legal, legalPage(legal));
  }

  const [defaultLang] = LANGUAGES;
  const notFound = {
    lang: defaultLang,
    t: locales[defaultLang],
    site,
    url: '/404.html',
    alternates: alternatesFor('home'),
    title: `${locales[defaultLang].notFound.title} | ${site.author}`,
    description: locales[defaultLang].notFound.text,
  };
  pages['404.html'] = renderPage(notFound, notFoundPage(locales));

  const target = `${route(defaultLang, 'home')}#projects`;
  for (const file of LEGACY_PAGES) {
    pages[file] =
      `<!doctype html>\n<html lang="${defaultLang}">\n<meta charset="utf-8">\n<title>${site.author}</title>\n` +
      `<meta name="robots" content="noindex">\n<link rel="canonical" href="${site.baseUrl}/">\n` +
      `<meta http-equiv="refresh" content="0; url=${target}">\n<a href="${target}">${site.author}</a>\n</html>\n`;
  }

  const indexed = Object.keys(pages).filter((file) => file.endsWith('index.html'));
  assets['sitemap.xml'] =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    indexed.map((file) => `  <url><loc>${site.baseUrl}/${file.replace(/index\.html$/, '')}</loc></url>\n`).join('') +
    '</urlset>\n';

  return { pages, assets };
}

/**
 * Compile le site dans `outDir`.
 * @param {object} [options]
 * @param {string} [options.outDir] dossier de sortie (par défaut, la racine du dépôt)
 * @param {boolean} [options.styles=true] compiler aussi la feuille de style Tailwind
 * @returns {Promise<{ files: string[], warnings: string[] }>}
 */
export async function buildSite({ outDir = ROOT, styles = true } = {}) {
  const content = await loadContent();
  const { errors, warnings } = validateContent(content);
  if (errors.length > 0) {
    throw new Error(`Contenu invalide :\n- ${errors.join('\n- ')}`);
  }

  await Promise.all(GENERATED_DIRS.map((dir) => rm(join(outDir, dir), { recursive: true, force: true })));

  const { pages, assets } = renderSite(content);
  const files = { ...pages, ...assets };
  await Promise.all(Object.entries(files).map(([file, text]) => write(outDir, file, text)));

  await mkdir(join(outDir, 'assets/fonts'), { recursive: true });
  await mkdir(join(outDir, 'js'), { recursive: true });
  await Promise.all([
    ...FONTS.map((font) => copyFile(join(ROOT, 'node_modules', font), join(outDir, 'assets/fonts', font.split('/').pop()))),
    copyFile(join(ROOT, 'src/js/site.js'), join(outDir, 'js/site.js')),
  ]);

  if (styles) {
    execFileSync(
      join(ROOT, 'node_modules/.bin/tailwindcss'),
      ['-c', 'tailwind.config.cjs', '-i', 'src/styles/main.css', '-o', join(outDir, 'css/style.css'), '--minify'],
      { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] },
    );
  }

  return { files: Object.keys(files), warnings };
}

// Exécution directe : `node scripts/build.mjs`.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { files, warnings } = await buildSite();
  for (const warning of warnings) console.warn(`Avertissement : ${warning}`);
  console.log(`${files.length} fichiers générés.`);
}
