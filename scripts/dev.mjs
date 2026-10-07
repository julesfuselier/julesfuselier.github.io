/**
 * Serveur de développement.
 *
 *   node scripts/dev.mjs [port]
 *
 * Compile le site, le sert sur http://localhost:8080 et recompile à chaque
 * modification de `src/`. Recharger la page suffit pour voir le résultat.
 */

import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = Number(process.argv[2] ?? 8080);

const TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
};

/**
 * Lance la compilation dans un processus séparé : les gabarits modifiés sont
 * ainsi toujours rechargés.
 * @returns {Promise<void>}
 */
function build() {
  return new Promise((resolve) => {
    spawn(process.execPath, [join(ROOT, 'scripts/build.mjs')], { stdio: 'inherit' }).on('exit', () => resolve());
  });
}

/**
 * Résout une adresse en fichier, comme GitHub Pages : `/dossier/` sert
 * `/dossier/index.html`.
 * @param {string} url
 * @returns {Promise<string | null>} chemin du fichier, ou `null` s'il n'existe pas
 */
async function resolveFile(url) {
  const pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname);
  const path = join(ROOT, normalize(pathname));
  if (!path.startsWith(ROOT)) return null;
  try {
    const info = await stat(path);
    return info.isDirectory() ? join(path, 'index.html') : path;
  } catch {
    return null;
  }
}

await build();

createServer(async (request, response) => {
  const file = await resolveFile(request.url ?? '/');
  try {
    const body = await readFile(file ?? join(ROOT, '404.html'));
    const type = TYPES[extname(file ?? '.html')] ?? 'application/octet-stream';
    response.writeHead(file ? 200 : 404, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));

let pending = null;
watch(join(ROOT, 'src'), { recursive: true }, () => {
  // Regroupe les rafales d'événements d'un même enregistrement.
  clearTimeout(pending);
  pending = setTimeout(build, 150);
});
