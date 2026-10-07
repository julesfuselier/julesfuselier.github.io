/**
 * Altitude des sommets de la carte des projets.
 *
 * Chaque projet est une montagne, et sa hauteur dépend du temps passé
 * dessus (heures relevées par WakaTime, saisies dans `site.json`).
 *
 * L'échelle est logarithmique : sans cela, un projet de 300 heures
 * écraserait un projet de 20 heures, qui deviendrait invisible. Avec le
 * logarithme, doubler le temps passé ajoute toujours la même hauteur.
 *
 *   t        = (ln(1 + h) − ln(1 + hMin)) / (ln(1 + hMax) − ln(1 + hMin))
 *   altitude = MIN + (MAX − MIN) × t
 *
 * Le projet le moins long culmine donc à MIN, le plus long à MAX.
 */

/** Bornes d'altitude, en mètres : socle du massif et plus haut sommet. */
export const ALTITUDE = { min: 820, max: 2650 };

/**
 * Altitude d'un projet à partir de ses heures.
 * @param {number} hours heures passées sur le projet
 * @param {number} minHours heures du projet le moins long
 * @param {number} maxHours heures du projet le plus long
 * @returns {number} altitude en mètres, entre `ALTITUDE.min` et `ALTITUDE.max`
 */
export function altitudeFromHours(hours, minHours, maxHours) {
  const range = Math.log1p(maxHours) - Math.log1p(minHours);
  // Tous les projets ont la même durée : ils partagent le plus haut sommet.
  const t = range === 0 ? 1 : (Math.log1p(hours) - Math.log1p(minHours)) / range;
  return ALTITUDE.min + (ALTITUDE.max - ALTITUDE.min) * t;
}

/**
 * Altitude de chaque projet. Tant qu'il manque les heures d'un seul projet,
 * aucune altitude n'est calculée : la carte garde des sommets de même
 * hauteur plutôt que d'afficher un classement à moitié inventé.
 * @param {Record<string, { hours?: number | null }>} projects projets de `site.json`
 * @returns {Record<string, number> | null} altitude en mètres par projet, ou `null`
 */
export function projectAltitudes(projects) {
  const entries = Object.entries(projects).map(([slug, project]) => [slug, project.hours]);
  if (entries.length === 0 || entries.some(([, hours]) => typeof hours !== 'number' || hours < 0)) return null;
  const all = entries.map(([, hours]) => hours);
  const minHours = Math.min(...all);
  const maxHours = Math.max(...all);
  return Object.fromEntries(entries.map(([slug, hours]) => [slug, Math.round(altitudeFromHours(hours, minHours, maxHours))]));
}

/**
 * Hauteur relative d'un sommet, pour le dessin : 1 pour le plus haut possible.
 * @param {number | undefined} altitude en mètres ; sans altitude, hauteur maximale
 * @returns {number} entre 0 et 1
 */
export function relativeHeight(altitude) {
  return altitude === undefined ? 1 : altitude / ALTITUDE.max;
}
