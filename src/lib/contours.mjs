/**
 * Génération de courbes de niveau (carte topographique) en SVG.
 *
 * La carte est calculée à la compilation : la même graine et les mêmes
 * sommets donnent toujours le même tracé. Aucun JavaScript n'est exécuté
 * dans le navigateur pour la dessiner.
 *
 * Étapes :
 *  1. un champ d'altitude = un sommet principal + du bruit lissé ;
 *  2. l'algorithme des « marching squares » extrait les segments de chaque
 *     courbe de niveau ;
 *  3. les segments sont chaînés en polylignes pour alléger le SVG.
 */

/**
 * Altitude de la première courbe de niveau et écart entre deux courbes,
 * pour un champ d'altitude compris entre 0 et 1. La carte 2D et le relief 3D
 * partagent ces valeurs : leurs courbes passent aux mêmes endroits.
 * @param {number} levels nombre de courbes
 * @returns {{ base: number, step: number }}
 */
export function contourScale(levels) {
  return { base: 0.12, step: 0.78 / (levels + 1) };
}

/** Nombre de courbes de niveau d'une carte. */
export const CONTOUR_LEVELS = 13;

/**
 * Hache une chaîne en entier 32 bits (FNV-1a).
 * @param {string} text
 * @returns {number}
 */
export function hashString(text) {
  let hash = 0x811c9dc5;
  for (const char of text) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Générateur pseudo-aléatoire déterministe (mulberry32).
 * @param {number} seed
 * @returns {() => number} fonction renvoyant un nombre dans [0, 1[
 */
export function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Bruit de valeur lissé : une grille de valeurs aléatoires interpolées.
 * @param {() => number} random
 * @param {number} size nombre de cellules de la grille de bruit
 * @returns {(x: number, y: number) => number} valeur dans [0, 1] pour x, y dans [0, 1]
 */
function createNoise(random, size) {
  const grid = Array.from({ length: (size + 1) * (size + 1) }, random);
  const at = (ix, iy) => grid[iy * (size + 1) + ix];
  const smooth = (t) => t * t * (3 - 2 * t);

  return (x, y) => {
    const gx = Math.min(x * size, size - 1e-9);
    const gy = Math.min(y * size, size - 1e-9);
    const ix = Math.floor(gx);
    const iy = Math.floor(gy);
    const tx = smooth(gx - ix);
    const ty = smooth(gy - iy);
    const top = at(ix, iy) + (at(ix + 1, iy) - at(ix, iy)) * tx;
    const bottom = at(ix, iy + 1) + (at(ix + 1, iy + 1) - at(ix, iy + 1)) * tx;
    return top + (bottom - top) * ty;
  };
}

/**
 * @typedef {object} Peak
 * @property {number} x position horizontale, de 0 à 1
 * @property {number} y position verticale, de 0 à 1
 * @property {number} [height] hauteur relative du sommet, de 0 à 1 (1 par défaut)
 */

/**
 * Exposant appliqué à l'altitude du champ pour obtenir la hauteur dessinée
 * en 3D : au-dessus de 1, il aplatit les vallées et dresse les sommets, ce
 * qui donne des montagnes plutôt que des collines.
 */
export const RELIEF_EXPONENT = 1.7;

/**
 * Bruit « à crêtes » : plusieurs couches de bruit, de plus en plus fines,
 * repliées autour de leur valeur médiane. Là où une couche passe par cette
 * valeur, le repli forme une arête vive : c'est ce qui donne des lignes de
 * crête et des ravines plutôt que des bosses lisses.
 * @param {() => number} random
 * @returns {(x: number, y: number) => number} valeur dans [0, 1]
 */
function createRidgedNoise(random) {
  const layers = [5, 10, 20, 40].map((size) => createNoise(random, size));
  return (x, y) => {
    let sum = 0;
    let total = 0;
    let weight = 0.5;
    for (const noise of layers) {
      const ridge = 1 - Math.abs(2 * noise(x, y) - 1);
      sum += ridge * ridge * weight;
      total += weight;
      weight *= 0.5; // chaque couche plus fine pèse deux fois moins
    }
    return sum / total;
  };
}

/**
 * Niveau d'un sommet dans le champ. L'exposant du relief est compensé ici,
 * pour que la hauteur dessinée en 3D reste proportionnelle à `peak.height` :
 * un sommet deux fois moins haut apparaît deux fois moins haut.
 * @param {Peak} peak
 * @returns {number} entre 0 et 1
 */
function peakLevel(peak) {
  return (peak.height ?? 1) ** (1 / RELIEF_EXPONENT);
}

/**
 * Construit le champ d'altitude échantillonné sur une grille.
 *
 * Chaque sommet est une cloche, déformée pour que son pied soit irrégulier,
 * puis creusée par le bruit à crêtes. Le creusement s'efface en approchant
 * du sommet : la hauteur d'une montagne ne dépend donc que de `peak.height`,
 * jamais du hasard.
 * @param {number} seed
 * @param {number} cols
 * @param {number} rows
 * @param {Peak[]} peaks sommets de la carte
 * @returns {number[][]} altitudes, par ligne puis par colonne
 */
function buildField(seed, cols, rows, peaks) {
  const random = createRandom(seed);
  const broad = createNoise(random, 3);
  const ridged = createRidgedNoise(random);
  // Hauteur d'une cellule rapportée à sa largeur : garde le relief à la même
  // échelle dans les deux directions, quel que soit le format de la carte.
  const aspect = rows / cols;
  // Plus il y a de sommets, plus chacun est étroit, pour qu'ils restent distincts.
  const sharpness = peaks.length > 1 ? 26 : 9;

  const values = [];
  for (let row = 0; row <= rows; row += 1) {
    const line = [];
    for (let col = 0; col <= cols; col += 1) {
      const x = col / cols;
      const y = row / rows;
      const undulation = broad(x, Math.min(y * aspect, 1));
      const stretch = 0.8 + 0.4 * undulation; // pied de montagne irrégulier

      let envelope = 0;
      let closeness = 0; // 1 au sommet le plus influent ici, 0 loin de lui
      for (const peak of peaks) {
        const level = peakLevel(peak);
        // Un sommet bas est aussi plus étroit : il garde des pentes de
        // montagne au lieu de s'étaler en colline.
        const distance = (Math.hypot(x - peak.x, (y - peak.y) * aspect) * stretch) / (0.45 + 0.55 * level);
        // L'exposant 0,7 resserre la cloche près du sommet : une pointe, pas un dôme.
        const bell = Math.exp(-((distance * distance * sharpness) ** 0.7));
        if (level * bell > envelope) {
          envelope = level * bell;
          closeness = bell;
        }
      }

      const carving = ridged(x, Math.min(y * aspect, 1));
      const kept = carving + (1 - carving) * closeness ** 6; // intact au sommet, quelle que soit sa hauteur
      line.push(envelope * (0.35 + 0.65 * kept) * 0.84 + undulation * 0.12);
    }
    values.push(line);
  }
  return values;
}

/**
 * Champ d'altitude d'une carte, échantillonné sur une grille de
 * `cols + 1` par `rows + 1` points. Le relief ne dépend que de la graine et
 * des sommets, pas de la finesse de la grille.
 * @param {object} options
 * @param {string} options.seed texte servant de graine pour le bruit
 * @param {Peak[]} options.peaks sommets de la carte
 * @param {number} options.cols nombre de cellules en largeur
 * @param {number} options.rows nombre de cellules en hauteur
 * @returns {number[][]} altitudes entre 0 et 1, par ligne puis par colonne
 */
export function createHeightField({ seed, peaks, cols, rows }) {
  return buildField(hashString(seed), cols, rows, peaks);
}

/**
 * Table des « marching squares » : pour chaque configuration de coins
 * (bit 8 = haut-gauche, 4 = haut-droit, 2 = bas-droit, 1 = bas-gauche),
 * les paires d'arêtes à relier. Arêtes : 0 haut, 1 droite, 2 bas, 3 gauche.
 */
const CASES = [
  [], [[3, 2]], [[2, 1]], [[3, 1]], [[0, 1]], [[0, 3], [2, 1]], [[0, 2]], [[0, 3]],
  [[0, 3]], [[0, 2]], [[0, 1], [3, 2]], [[0, 1]], [[3, 1]], [[2, 1]], [[3, 2]], [],
];

/**
 * Extrait les segments d'une courbe de niveau.
 * @param {number[][]} values champ d'altitude
 * @param {number} level altitude de la courbe
 * @returns {[number, number, number, number][]} segments x1, y1, x2, y2 en unités de grille
 */
function traceLevel(values, level) {
  const rows = values.length - 1;
  const cols = values[0].length - 1;
  const lerp = (a, b) => (level - a) / (b - a);
  const segments = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const tl = values[row][col];
      const tr = values[row][col + 1];
      const br = values[row + 1][col + 1];
      const bl = values[row + 1][col];
      const index = (tl > level ? 8 : 0) | (tr > level ? 4 : 0) | (br > level ? 2 : 0) | (bl > level ? 1 : 0);

      /** Point d'intersection de la courbe avec une arête de la cellule. */
      const edgePoint = (edge) => {
        if (edge === 0) return [col + lerp(tl, tr), row];
        if (edge === 1) return [col + 1, row + lerp(tr, br)];
        if (edge === 2) return [col + lerp(bl, br), row + 1];
        return [col, row + lerp(tl, bl)];
      };

      for (const [from, to] of CASES[index]) {
        segments.push([...edgePoint(from), ...edgePoint(to)]);
      }
    }
  }
  return segments;
}

/**
 * Chaîne des segments bout à bout en polylignes.
 * @param {[number, number, number, number][]} segments
 * @param {(value: number) => string} format formatage d'une coordonnée
 * @returns {string[][]} polylignes, chacune étant une liste de points "x y"
 */
function chainSegments(segments, format) {
  const edges = segments.map(([x1, y1, x2, y2]) => [`${format(x1)} ${format(y1)}`, `${format(x2)} ${format(y2)}`]);
  const byPoint = new Map();
  edges.forEach(([a, b], index) => {
    for (const point of [a, b]) {
      if (!byPoint.has(point)) byPoint.set(point, []);
      byPoint.get(point).push(index);
    }
  });

  const used = new Array(edges.length).fill(false);
  /** Prolonge une polyligne depuis `point` tant qu'un segment libre s'y raccorde. */
  const extend = (point, push) => {
    let current = point;
    for (;;) {
      const next = (byPoint.get(current) ?? []).find((index) => !used[index]);
      if (next === undefined) return;
      used[next] = true;
      const [a, b] = edges[next];
      current = a === current ? b : a;
      push(current);
    }
  };

  const lines = [];
  edges.forEach(([a, b], index) => {
    if (used[index]) return;
    used[index] = true;
    const line = [a, b];
    extend(b, (point) => line.push(point));
    extend(a, (point) => line.unshift(point));
    lines.push(line);
  });
  return lines;
}

/**
 * Génère une carte de courbes de niveau.
 * @param {object} options
 * @param {string} options.seed texte servant de graine pour le bruit
 * @param {Peak[]} options.peaks sommets de la carte
 * @param {number} [options.width=900] largeur du SVG
 * @param {number} [options.height=720] hauteur du SVG
 * @param {number} [options.levels] nombre de courbes
 * @returns {string} document SVG (traits noirs, utilisable comme masque CSS)
 */
export function createContourMap({ seed, peaks, width = 900, height = 720, levels = CONTOUR_LEVELS }) {
  const cols = Math.round(width / 12.5);
  const rows = Math.round((cols * height) / width);
  const values = createHeightField({ seed, peaks, cols, rows });
  const { base, step: gap } = contourScale(levels);
  const scaleX = width / cols;
  const scaleY = height / rows;

  const paths = { minor: [], major: [] };
  for (let step = 1; step <= levels; step += 1) {
    const level = base + step * gap;
    const lines = chainSegments(traceLevel(values, level), (value) => value.toFixed(3));
    const d = lines
      .map((line) => {
        const points = line.map((point) => {
          const [x, y] = point.split(' ').map(Number);
          return `${(x * scaleX).toFixed(1)} ${(y * scaleY).toFixed(1)}`;
        });
        return `M${points.join('L')}`;
      })
      .join('');
    // Une courbe sur quatre est une « courbe maîtresse », tracée plus épaisse.
    (step % 4 === 0 ? paths.major : paths.minor).push(d);
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round">` +
    `<path stroke-width="1" d="${paths.minor.join('')}"/>` +
    `<path stroke-width="2.2" d="${paths.major.join('')}"/>` +
    '</svg>\n'
  );
}
