/**
 * Relève les heures passées sur chaque projet dans WakaTime et les écrit
 * dans `src/content/site.json` (champ `hours`), d'où la compilation tire la
 * hauteur des sommets (voir `src/lib/altitude.mjs`).
 *
 *   WAKATIME_API_KEY=… npm run wakatime            met à jour les heures
 *   WAKATIME_API_KEY=… npm run wakatime -- --list  affiche les noms de projets WakaTime
 *
 * Dans `site.json`, chaque projet indique sous `wakatime` le ou les noms de
 * projets WakaTime qui lui correspondent ; leurs heures sont additionnées.
 * Un projet sans nom WakaTime garde les heures saisies à la main.
 *
 * La clé ne doit jamais être écrite dans le dépôt, qui est public : elle est
 * lue dans l'environnement (en local) ou dans un secret GitHub (workflow
 * `.github/workflows/wakatime.yml`).
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const API = 'https://wakatime.com/api/v1/users/current';
const SITE_FILE = fileURLToPath(new URL('../src/content/site.json', import.meta.url));

/**
 * Interroge l'API WakaTime.
 * @param {string} path chemin après `/users/current`
 * @param {string} apiKey
 * @param {typeof fetch} fetchImpl remplaçable dans les tests
 * @returns {Promise<any>} réponse JSON
 */
async function callApi(path, apiKey, fetchImpl) {
  const response = await fetchImpl(API + path, {
    headers: { Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}` },
  });
  if (!response.ok) throw new Error(`WakaTime a répondu ${response.status} pour ${path}`);
  return response.json();
}

/**
 * Heures passées sur un projet WakaTime depuis sa création.
 * @param {string} name nom du projet dans WakaTime
 * @param {string} apiKey
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<number>}
 */
export async function fetchProjectHours(name, apiKey, fetchImpl = fetch) {
  const { data } = await callApi(`/all_time_since_today?project=${encodeURIComponent(name)}`, apiKey, fetchImpl);
  // WakaTime calcule ce total en tâche de fond : au premier appel, il peut
  // ne pas être prêt. Mieux vaut échouer que d'enregistrer un total partiel.
  if (data.is_up_to_date === false) throw new Error(`Total pas encore calculé pour « ${name} » : relancer dans quelques minutes`);
  return data.total_seconds / 3600;
}

/**
 * Met à jour les heures des projets de `site.json` qui déclarent des noms WakaTime.
 * @param {any} site contenu de `site.json`
 * @param {(name: string) => Promise<number>} hoursOf heures d'un projet WakaTime
 * @returns {Promise<any>} copie de `site` avec les heures à jour, arrondies à l'heure
 */
export async function updateHours(site, hoursOf) {
  const projects = {};
  for (const [slug, project] of Object.entries(site.projects)) {
    const names = project.wakatime ?? [];
    if (names.length === 0) {
      projects[slug] = project; // heures saisies à la main, laissées telles quelles
      continue;
    }
    let total = 0;
    for (const name of names) total += await hoursOf(name);
    projects[slug] = { ...project, hours: Math.round(total) };
  }
  return { ...site, projects };
}

/**
 * Noms de tous les projets WakaTime du compte.
 * @param {string} apiKey
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<string[]>}
 */
export async function listProjectNames(apiKey, fetchImpl = fetch) {
  const names = [];
  for (let page = 1; ; page += 1) {
    const { data, total_pages: totalPages = 1 } = await callApi(`/projects?page=${page}`, apiKey, fetchImpl);
    names.push(...data.map((project) => project.name));
    if (page >= totalPages) return names;
  }
}

async function main() {
  const apiKey = process.env.WAKATIME_API_KEY;
  if (!apiKey) throw new Error('Variable WAKATIME_API_KEY absente');

  if (process.argv.includes('--list')) {
    for (const name of await listProjectNames(apiKey)) console.log(name);
    return;
  }

  const site = JSON.parse(await readFile(SITE_FILE, 'utf8'));
  const updated = await updateHours(site, (name) => fetchProjectHours(name, apiKey));
  await writeFile(SITE_FILE, `${JSON.stringify(updated, null, 2)}\n`);
  for (const [slug, project] of Object.entries(updated.projects)) {
    console.log(`${slug} : ${project.hours ?? 'non renseigné'} h`);
  }
}

// Exécuté seulement en ligne de commande, pas quand les tests importent ce fichier.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
