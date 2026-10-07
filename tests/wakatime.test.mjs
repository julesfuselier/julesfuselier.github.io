import assert from 'node:assert/strict';
import { test } from 'node:test';

import { fetchProjectHours, listProjectNames, updateHours, wakatimeNames } from '../scripts/wakatime.mjs';

/** Faux `fetch` : renvoie le JSON prévu pour chaque adresse appelée. */
const fakeFetch = (responses) => async (url) => {
  const body = responses[url.replace('https://wakatime.com/api/v1/users/current', '')];
  return { ok: body !== undefined, status: body === undefined ? 404 : 200, json: async () => body };
};

test('les heures de plusieurs projets WakaTime sont additionnées et arrondies', async () => {
  const site = { projects: { agape: { repos: ['jules/veille', 'jules/middleware'], hours: null } } };
  const { site: updated, unknown } = await updateHours(site, async (name) => ({ veille: 100.4, middleware: 50.3 })[name]);
  assert.equal(updated.projects.agape.hours, 151);
  assert.deepEqual(unknown, []);
});

test('les heures passées hors de WakaTime sont ajoutées au total', async () => {
  const site = { projects: { agape: { repos: ['jules/connecteur'], untrackedHours: 21, hours: null } } };
  const { site: updated } = await updateHours(site, async () => 40);
  assert.equal(updated.projects.agape.hours, 61);
});

test('le nom WakaTime est celui du dépôt, sauf indication contraire', () => {
  assert.deepEqual(wakatimeNames({ repos: ['jules/Pathside'] }), ['Pathside']);
  assert.deepEqual(wakatimeNames({ repos: ['jules/Pathside'], wakatime: ['pathside-app'] }), ['pathside-app']);
  assert.deepEqual(wakatimeNames({}), []);
});

test('un projet sans dépôt garde ses heures saisies à la main', async () => {
  const site = { projects: { client: { hours: 40 }, vide: { repos: [], hours: null } } };
  const { site: updated } = await updateHours(site, async () => assert.fail('aucun appel attendu'));
  assert.deepEqual(updated.projects, site.projects);
});

test('un nom inconnu de WakaTime est signalé et ne remet pas les heures à zéro', async () => {
  const site = { projects: { agape: { repos: ['jules/veille', 'jules/faute'], hours: 120 } } };
  const { site: updated, unknown } = await updateHours(site, async (name) => (name === 'veille' ? 100 : 0));
  assert.equal(updated.projects.agape.hours, 120);
  assert.deepEqual(unknown, ['faute']);
});

test('les secondes de WakaTime sont converties en heures', async () => {
  const fetchImpl = fakeFetch({ '/all_time_since_today?project=Path%20Side': { data: { total_seconds: 7200, is_up_to_date: true } } });
  assert.equal(await fetchProjectHours('Path Side', 'clé', fetchImpl), 2);
});

test('un total pas encore calculé fait échouer le relevé', async () => {
  const fetchImpl = fakeFetch({ '/all_time_since_today?project=x': { data: { total_seconds: 10, is_up_to_date: false } } });
  await assert.rejects(fetchProjectHours('x', 'clé', fetchImpl), /pas encore calculé/);
});

test('un projet inconnu de WakaTime compte pour zéro heure', async () => {
  assert.equal(await fetchProjectHours('inconnu', 'clé', fakeFetch({})), 0);
});

test('une erreur de WakaTime est signalée', async () => {
  const refused = async () => ({ ok: false, status: 401, json: async () => ({}) });
  await assert.rejects(fetchProjectHours('x', 'mauvaise clé', refused), /401/);
});

test('la liste des projets suit la pagination', async () => {
  const fetchImpl = fakeFetch({
    '/projects?page=1': { data: [{ name: 'a' }], total_pages: 2 },
    '/projects?page=2': { data: [{ name: 'b' }], total_pages: 2 },
  });
  assert.deepEqual(await listProjectNames('clé', fetchImpl), ['a', 'b']);
});
