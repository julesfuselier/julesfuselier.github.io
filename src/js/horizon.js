/**
 * Chaînes lointaines derrière le relief des projets.
 *
 * Sans elles, le relief flotte seul dans un grand vide. Ce sont trois lignes
 * de crêtes dessinées en SVG derrière le canevas 3D, de plus en plus pâles
 * avec la distance, comme dans la brume. Purement décoratives : aucune ne
 * correspond à un projet.
 *
 * Elles ne sont pas en 3D : vues de haut, de vraies montagnes lointaines
 * s'écraseraient au lieu de se découper sur le ciel. Pour garder l'illusion
 * quand on fait tourner le relief, chaque couche glisse un peu sur le côté,
 * d'autant moins qu'elle est loin (effet de parallaxe).
 */

import { createRandom, hashString } from '../lib/contours.mjs';

/**
 * Couches, de la plus lointaine à la plus proche : ligne de base et
 * amplitude des crêtes (en % de la hauteur du dessin), finesse du relief,
 * opacité, et glissement par degré de rotation (en % de la largeur).
 */
const LAYERS = [
  { base: 56, amplitude: 46, bumps: 7, opacity: 0.08, shift: 0.05 },
  { base: 70, amplitude: 38, bumps: 10, opacity: 0.12, shift: 0.1 },
  { base: 84, amplitude: 30, bumps: 14, opacity: 0.17, shift: 0.16 },
];

/** Nombre de points par ligne de crête. */
const SAMPLES = 160;

/**
 * Bruit en une dimension, lissé, entre 0 et 1.
 * @param {() => number} random
 * @param {number} size nombre de valeurs aléatoires sur la largeur
 */
function createNoise1d(random, size) {
  const values = Array.from({ length: size + 2 }, random);
  return (x) => {
    const position = x * size;
    const index = Math.floor(position);
    const t = position - index;
    const smooth = t * t * (3 - 2 * t);
    return values[index] + (values[index + 1] - values[index]) * smooth;
  };
}

/**
 * Tracé d'une ligne de crêtes fermée par le bas, dans un repère 0–100.
 * Le bruit est « replié » (1 − |2n − 1|) pour donner des pointes plutôt que
 * des collines, et une couche plus fine ajoute des arêtes secondaires.
 * @param {() => number} random
 * @param {typeof LAYERS[number]} layer
 * @returns {string} attribut `d`
 */
function ridgePath(random, layer) {
  const coarse = createNoise1d(random, layer.bumps);
  const fine = createNoise1d(random, layer.bumps * 4);
  let d = 'M0 100';
  for (let i = 0; i <= SAMPLES; i += 1) {
    const x = i / SAMPLES;
    const peak = (1 - Math.abs(2 * coarse(x) - 1)) ** 1.5;
    const detail = 1 - Math.abs(2 * fine(x) - 1);
    const height = 0.8 * peak + 0.2 * detail;
    d += `L${(x * 100).toFixed(2)} ${(layer.base - layer.amplitude * height).toFixed(2)}`;
  }
  return `${d}L100 100Z`;
}

/**
 * Ajoute les chaînes lointaines à la carte, derrière le canevas.
 * @param {HTMLElement} map
 * @returns {{ turn: (azimuth: number) => void, remove: () => void }}
 *   `turn` décale les couches selon la rotation du relief (en degrés)
 */
export function mountHorizon(map) {
  const random = createRandom(hashString('horizon'));
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'project-horizon');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');

  const paths = LAYERS.map((layer) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', ridgePath(random, layer));
    path.setAttribute('fill-opacity', String(layer.opacity));
    svg.append(path);
    return path;
  });
  map.prepend(svg);

  return {
    turn(azimuth) {
      LAYERS.forEach((layer, index) => {
        paths[index].setAttribute('transform', `translate(${(-azimuth * layer.shift).toFixed(3)} 0)`);
      });
    },
    remove() {
      svg.remove();
    },
  };
}
