/**
 * Relève les heures passées sur chaque projet dans WakaTime et les écrit
 * dans `src/content/site.json` (champ `hours`), d'où la compilation tire la
 * hauteur des sommets (voir `src/lib/altitude.mjs`).
 *
 *   WAKATIME_API_KEY=… npm run wakatime            met à jour les heures
 *   WAKATIME_API_KEY=… npm run wakatime -- --list  affiche les noms de projets WakaTime
 *
 * Dans `site.json`, chaque projet liste ses dépôts GitHub sous `repos`
 * (`propriétaire/nom`). WakaTime nomme un projet d'après son dossier, donc
 * d'après le nom du dépôt : c'est ce nom qui est interrogé, et les heures de
 * plusieurs dépôts sont additionnées. Si un projet porte un autre nom dans
 * WakaTime, le champ facultatif `wakatime` donne la liste des noms à utiliser.
 * Un projet sans dépôt garde les heures saisies à la main.
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
 * @returns {Promise<any>} réponse JSON, ou `null` si WakaTime ne connaît pas la ressource
 */
async function callApi(path, apiKey, fetchImpl) {
  const response = await fetchImpl(API + path, {
    headers: { Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}` },
  });
  if (response.status === 404) return null; // ressource inconnue de WakaTime
  if (!response.ok) throw new Error(`WakaTime a répondu ${response.status} pour ${path}`);
  return response.json();
}

/**
 * Heures passées sur un projet WakaTime depuis sa création.
 * @param {string} name nom du projet dans WakaTime
 * @param {string} apiKey
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<number>} 0 si WakaTime ne connaît aucun projet de ce nom
 */
export async function fetchProjectHours(name, apiKey, fetchImpl = fetch) {
  const body = await callApi(`/all_time_since_today?project=${encodeURIComponent(name)}`, apiKey, fetchImpl);
  if (body === null) return 0;
  const { data } = body;
  // WakaTime calcule ce total en tâche de fond : au premier appel, il peut
  // ne pas être prêt. Mieux vaut échouer que d'enregistrer un total partiel.
  if (data.is_up_to_date === false) throw new Error(`Total pas encore calculé pour « ${name} » : relancer dans quelques minutes`);
  return data.total_seconds / 3600;
}

/**
 * Noms WakaTime d'un projet du site : ceux du champ `wakatime` s'il existe,
 * sinon le nom de chacun de ses dépôts.
 * @param {{ repos?: string[], wakatime?: string[] }} project
 * @returns {string[]}
 */
export function wakatimeNames(project) {
  return project.wakatime ?? (project.repos ?? []).map((repo) => repo.split('/').pop());
}

/**
 * Met à jour les heures des projets de `site.json` reliés à WakaTime.
 *
 * Un nom pour lequel WakaTime ne connaît aucune heure est presque toujours
 * un nom mal orthographié : le projet garde alors ses heures précédentes,
 * et le nom est signalé, plutôt que d'aplatir son sommet sans prévenir.
 * @param {any} site contenu de `site.json`
 * @param {(name: string) => Promise<number>} hoursOf heures d'un projet WakaTime
 * @returns {Promise<{ site: any, unknown: string[] }>} copie de `site` avec les
 *   heures à jour, arrondies à l'heure, et noms sans aucune heure
 */
export async function updateHours(site, hoursOf) {
  const projects = {};
  const unknown = [];
  for (const [slug, project] of Object.entries(site.projects)) {
    const names = wakatimeNames(project);
    let total = 0;
    let complete = names.length > 0;
    for (const name of names) {
      const hours = await hoursOf(name);
      if (hours === 0) {
        unknown.push(name);
        complete = false;
      }
      total += hours;
    }
    projects[slug] = complete ? { ...project, hours: Math.round(total) } : project;
  }
  return { site: { ...site, projects }, unknown };
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
    const body = await callApi(`/projects?page=${page}`, apiKey, fetchImpl);
    if (body === null) throw new Error('WakaTime ne renvoie pas la liste des projets');
    const { data, total_pages: totalPages = 1 } = body;
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
  const { site: updated, unknown } = await updateHours(site, (name) => fetchProjectHours(name, apiKey));
  await writeFile(SITE_FILE, `${JSON.stringify(updated, null, 2)}\n`);
  for (const [slug, project] of Object.entries(updated.projects)) {
    console.log(`${slug} : ${project.hours ?? 'non renseigné'} h`);
  }
  for (const name of unknown) {
    console.warn(`Aucune heure dans WakaTime pour « ${name} » : vérifier le nom (npm run wakatime -- --list)`);
  }
}

// Exécuté seulement en ligne de commande, pas quand les tests importent ce fichier.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
