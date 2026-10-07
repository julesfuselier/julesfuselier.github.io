/**
 * Sentier de la carte des projets : une courbe lisse qui passe par chaque
 * sommet, dans l'ordre où ils sont donnés.
 *
 * Le même tracé sert à la carte 2D (calculé à la compilation) et au relief
 * 3D (recalculé dans le navigateur, puis plaqué sur le terrain).
 */

/** Nombre de points calculés entre deux sommets voisins. */
const STEPS = 16;

/**
 * Interpolation de Catmull-Rom : une courbe qui passe exactement par `b`
 * et `c`, en tenant compte des voisins `a` et `d` pour arrondir les virages.
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 * @param {number} t position entre `b` (0) et `c` (1)
 * @returns {number}
 */
function catmullRom(a, b, c, d, t) {
  return 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
}

/**
 * Points du sentier.
 * @param {{ x: number, y: number }[]} summits sommets à relier, dans l'ordre du parcours
 * @returns {{ x: number, y: number }[]} points du sentier, dans les mêmes unités
 */
export function trailPoints(summits) {
  if (summits.length < 2) return [];
  const at = (index) => summits[Math.max(0, Math.min(summits.length - 1, index))];
  const points = [];
  for (let i = 0; i < summits.length - 1; i += 1) {
    for (let step = 0; step < STEPS; step += 1) {
      const t = step / STEPS;
      points.push({
        x: catmullRom(at(i - 1).x, at(i).x, at(i + 1).x, at(i + 2).x, t),
        y: catmullRom(at(i - 1).y, at(i).y, at(i + 1).y, at(i + 2).y, t),
      });
    }
  }
  points.push({ ...summits.at(-1) });
  return points;
}

/**
 * Attribut `d` d'un `<path>` SVG reliant les points.
 * @param {{ x: number, y: number }[]} points
 * @returns {string}
 */
export function trailPath(points) {
  return points.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join('');
}
