import assert from 'node:assert/strict';
import { test } from 'node:test';

import { fetchProjectHours, listProjectNames, updateHours } from '../scripts/wakatime.mjs';

/** Faux `fetch` : renvoie le JSON prévu pour chaque adresse appelée. */
const fakeFetch = (responses) => async (url) => {
  const body = responses[url.replace('https://wakatime.com/api/v1/users/current', '')];
  return { ok: body !== undefined, status: body === undefined ? 404 : 200, json: async () => body };
};

test('les heures de plusieurs projets WakaTime sont additionnées et arrondies', async () => {
  const site = { projects: { agape: { wakatime: ['veille', 'middleware'], hours: null } } };
  const updated = await updateHours(site, async (name) => ({ veille: 100.4, middleware: 50.3 })[name]);
  assert.equal(updated.projects.agape.hours, 151);
});

test('un projet sans nom WakaTime garde ses heures saisies à la main', async () => {
  const site = { projects: { client: { hours: 40 }, vide: { wakatime: [], hours: null } } };
  const updated = await updateHours(site, async () => assert.fail('aucun appel attendu'));
  assert.deepEqual(updated.projects, site.projects);
});

test('les secondes de WakaTime sont converties en heures', async () => {
  const fetchImpl = fakeFetch({ '/all_time_since_today?project=Path%20Side': { data: { total_seconds: 7200, is_up_to_date: true } } });
  assert.equal(await fetchProjectHours('Path Side', 'clé', fetchImpl), 2);
});

test('un total pas encore calculé fait échouer le relevé', async () => {
  const fetchImpl = fakeFetch({ '/all_time_since_today?project=x': { data: { total_seconds: 10, is_up_to_date: false } } });
  await assert.rejects(fetchProjectHours('x', 'clé', fetchImpl), /pas encore calculé/);
});

test('une erreur de WakaTime est signalée', async () => {
  await assert.rejects(fetchProjectHours('inconnu', 'clé', fakeFetch({})), /404/);
});

test('la liste des projets suit la pagination', async () => {
  const fetchImpl = fakeFetch({
    '/projects?page=1': { data: [{ name: 'a' }], total_pages: 2 },
    '/projects?page=2': { data: [{ name: 'b' }], total_pages: 2 },
  });
  assert.deepEqual(await listProjectNames('clé', fetchImpl), ['a', 'b']);
});
