/**
 * Randonneur 3D de l'en-tête, avec Three.js.
 *
 * Un personnage stylisé marche sur un petit socle de montagne : trois
 * sommets enneigés, un drapeau, des sapins et un sentier de pierres plates.
 * La scène de référence est modelée dans Spline ; ce fichier la reconstruit
 * avec les mêmes formes simples et les mêmes cotes (en unités Spline, un
 * personnage mesure environ 185 de haut), sans dépendre de Spline au
 * chargement de la page.
 *
 * Le personnage est articulé : chaque jambe et chaque bras pend à un pivot
 * placé à la hanche ou à l'épaule. La marche fait tourner ces pivots ; le
 * modèle est construit dans la pose « jambe gauche en avant », qui sert
 * aussi d'image fixe.
 *
 * Comportement :
 *  - l'animation ne tourne que si la scène est visible à l'écran et l'onglet
 *    actif ; sinon plus rien n'est dessiné ;
 *  - avec `prefers-reduced-motion`, la scène est dessinée une fois, immobile ;
 *  - le fond est transparent, et les couleurs suivent le thème clair ou
 *    sombre de la page.
 */

import {
  CylinderGeometry,
  ConeGeometry,
  Color,
  DirectionalLight,
  DodecahedronGeometry,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  Shape,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const DEGREES = Math.PI / 180;

/** Couleurs de la scène. `snow` et `flag` changent avec le thème, voir `themeColors`. */
const COLORS = {
  skin: '#e8b896',
  jacket: '#f07a3e',
  zip: '#c65a28',
  pants: '#3e4a52',
  boot: '#5a3a28',
  dark: '#1f2427',
  beanie: '#2f6f6a',
  beanieBand: '#24534f',
  pompom: '#eef0ec',
  backpack: '#4f6b5a',
  backpackDark: '#3d5546',
  mat: '#c9a24a',
  pole: '#a9b2b5',
  grass: '#6b7f5a',
  rock: '#6e6a64',
  mountain: '#7c8a90',
  trunk: '#5a3e2b',
  pineDark: '#3f5a44',
  pineLight: '#4a6a4f',
  stone: '#b8ae9a',
  pebbleLight: '#9aa3a6',
  pebbleDark: '#8a9599',
};

/** Point de vue : trois quarts depuis la droite, légèrement au-dessus. */
const VIEW = { fieldOfView: 28, azimuth: 35, elevation: 14, distance: 1340, target: new Vector3(18, 162, -40) };

/** Marche : durée d'un pas complet (deux enjambées), amplitudes en degrés et rebond. */
const WALK = { period: 1.1, leg: 20, arm: 25, bounce: 5, lean: 3, sway: 2, easeIn: 1 };

/**
 * Crée un maillage et l'ajoute à un parent.
 * @param {Group | Scene} parent
 * @param {import('three').BufferGeometry} geometry
 * @param {MeshStandardMaterial} material
 * @param {{ position?: number[], rotation?: number[], scale?: number[] }} [place] rotation en degrés
 * @returns {Mesh}
 */
function add(parent, geometry, material, { position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] } = {}) {
  const mesh = new Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.rotation.set(rotation[0] * DEGREES, rotation[1] * DEGREES, rotation[2] * DEGREES);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/**
 * Matériaux mats, un par couleur. `faceted` donne l'aspect taillé du décor
 * (une couleur par facette) ; le personnage reste lisse.
 * @returns {Record<keyof typeof COLORS, MeshStandardMaterial> & { snow: MeshStandardMaterial, flag: MeshStandardMaterial }}
 */
function createMaterials() {
  const faceted = new Set(['grass', 'rock', 'mountain', 'pineDark', 'pineLight', 'stone', 'pebbleLight', 'pebbleDark']);
  const materials = Object.fromEntries(
    Object.entries(COLORS).map(([name, color]) => [name, new MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, flatShading: faceted.has(name) })]),
  );
  materials.snow = new MeshStandardMaterial({ roughness: 0.7, flatShading: true });
  materials.flag = new MeshStandardMaterial({ roughness: 0.8 });
  return /** @type {any} */ (materials);
}

/**
 * Socle, montagnes, drapeau, sapins, rochers et sentier.
 * @param {ReturnType<typeof createMaterials>} m
 * @returns {{ group: Group, flag: Group }} le décor, et le drapeau qui flotte
 */
function createDiorama(m) {
  const group = new Group();

  add(group, new CylinderGeometry(240, 240, 36, 9), m.grass, { position: [0, -18, -40] });
  add(group, new CylinderGeometry(236, 130, 90, 9), m.rock, { position: [0, -81, -40] });

  // Trois sommets taillés à six faces, chacun coiffé de neige.
  const peaks = [
    { x: -120, z: -140, radius: 115, height: 300 },
    { x: 40, z: -150, radius: 130, height: 390 },
    { x: 160, z: -100, radius: 95, height: 240 },
  ];
  peaks.forEach(({ x, z, radius, height }, index) => {
    add(group, new ConeGeometry(radius, height, 6), m.mountain, { position: [x, height / 2, z], rotation: [0, index * 23, 0] });
    const cap = height * 0.32;
    add(group, new ConeGeometry(radius * 0.33, cap, 6), m.snow, { position: [x, height - cap / 2 + 1, z], rotation: [0, index * 23, 0] });
  });

  // Drapeau au sommet du plus haut : il pivote autour de sa hampe.
  add(group, new CylinderGeometry(2, 2, 50, 12), m.dark, { position: [40, 412, -150] });
  const flag = new Group();
  flag.position.set(40, 0, -150);
  const outline = new Shape();
  outline.moveTo(1.5, 445);
  outline.lineTo(29, 435);
  outline.lineTo(1.5, 425);
  outline.closePath();
  add(flag, new ExtrudeGeometry(outline, { depth: 2, bevelEnabled: false }), m.flag, { position: [0, 0, -1] });
  group.add(flag);

  // Sapins : un tronc et deux étages de feuillage, à différentes échelles.
  const pines = [
    [-190, 20, 1],
    [-160, 80, 0.75],
    [-200, -60, 0.85],
    [190, 40, 0.9],
    [205, -30, 0.7],
    [150, 110, 0.6],
  ];
  pines.forEach(([x, z, s], index) => {
    add(group, new CylinderGeometry(6 * s, 6 * s, 30 * s, 8), m.trunk, { position: [x, 15 * s, z] });
    add(group, new ConeGeometry(34 * s, 70 * s, 7), m.pineDark, { position: [x, 65 * s - 4, z], rotation: [0, index * 17, 0] });
    add(group, new ConeGeometry(24 * s, 56 * s, 7), m.pineLight, { position: [x, 90 * s, z], rotation: [0, index * 31, 0] });
  });

  // Rochers aplatis, en deux gris.
  const rocks = [
    [-70, 120, 22],
    [90, 140, 16],
    [-110, -40, 28],
    [110, -20, 20],
    [60, 60, 10],
    [-40, 170, 12],
  ];
  rocks.forEach(([x, z, r], index) => {
    add(group, new DodecahedronGeometry(1), index % 2 ? m.pebbleDark : m.pebbleLight, {
      position: [x, r * 0.4, z],
      rotation: [0, index * 41, 0],
      scale: [r, r * 0.65, r * 0.9],
    });
  });

  // Sentier de pierres plates, qui serpente vers le randonneur.
  [16, 15, 17, 15, 19, 14].forEach((radius, index) => {
    add(group, new CylinderGeometry(radius, radius, 4, 7), m.stone, {
      position: [-8 + Math.sin(index * 0.9) * 18, 1, 170 - index * 42],
      rotation: [0, index * 27, 0],
    });
  });

  return { group, flag };
}

/**
 * Le randonneur, articulé aux hanches et aux épaules, construit dans la pose
 * « jambe gauche et bras droit en avant ».
 * @param {ReturnType<typeof createMaterials>} m
 * @returns {{ body: Group, legs: Group[], arms: Group[], pompom: Mesh }}
 */
function createHiker(m) {
  const body = new Group();
  const box = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 3, r);
  const limb = (radius, height) => new CylinderGeometry(radius, radius, height, 16);
  const ball = (radius) => new SphereGeometry(radius, 24, 16);

  /** Pivot de membre, à l'articulation (hanche ou épaule). */
  const pivot = (x, y) => {
    const joint = new Group();
    joint.position.set(x, y, 0);
    body.add(joint);
    return joint;
  };

  // Jambes : la gauche en avant (-20°), la droite en arrière (+20°).
  const legL = pivot(-11, 64);
  add(legL, limb(9, 56), m.pants, { position: [0, -26.31, 9.58], rotation: [-20, 0, 0] });
  add(legL, box(22, 14, 32, 6), m.boot, { position: [0, -57, 24] });
  const legR = pivot(11, 64);
  add(legR, limb(9, 56), m.pants, { position: [0, -26.31, -9.58], rotation: [20, 0, 0] });
  add(legR, box(22, 14, 32, 6), m.boot, { position: [0, -57, -16] });

  // Bassin, veste, fermeture et bretelles du sac.
  add(body, box(42, 20, 28, 9), m.pants, { position: [0, 68, 0] });
  add(body, box(50, 56, 34, 14), m.jacket, { position: [0, 98, 0] });
  add(body, box(3, 46, 2, 0.5), m.zip, { position: [0, 98, 17.5] });
  add(body, box(6, 40, 3, 1), m.backpackDark, { position: [-14, 104, 17.8] });
  add(body, box(6, 40, 3, 1), m.backpackDark, { position: [14, 104, 17.8] });

  // Tête, yeux, bonnet et pompon.
  add(body, ball(23), m.skin, { position: [0, 148, 0] });
  add(body, ball(1), m.dark, { position: [-8, 150, 21.5], scale: [2.5, 3, 2.5] });
  add(body, ball(1), m.dark, { position: [8, 150, 21.5], scale: [2.5, 3, 2.5] });
  add(body, ball(1), m.beanie, { position: [0, 159, 0], scale: [24, 20, 24] });
  add(body, limb(24.6, 9), m.beanieBand, { position: [0, 159, 0] });
  const pompom = add(body, ball(6.5), m.pompom, { position: [0, 180, 0] });

  // Bras : le droit en avant avec le bâton, le gauche en arrière.
  const armR = pivot(31, 116);
  add(armR, limb(7.5, 46), m.jacket, { position: [0, -20.85, 9.72], rotation: [-25, 0, 0] });
  add(armR, ball(8), m.skin, { position: [0, -41.69, 19.44] });
  add(armR, new CylinderGeometry(2, 2, 112, 8), m.pole, { position: [1, -64, 28], rotation: [-21.4, 0, 0] });
  add(armR, limb(3.5, 12), m.dark, { position: [-1, -12, 7.5], rotation: [-21.4, 0, 0] });
  const armL = pivot(-31, 116);
  add(armL, limb(7.5, 46), m.jacket, { position: [0, -20.85, -9.72], rotation: [25, 0, 0] });
  add(armL, ball(8), m.skin, { position: [0, -41.69, -19.44] });

  // Sac à dos, poche et tapis de sol roulé.
  add(body, box(44, 52, 24, 10), m.backpack, { position: [0, 100, -29] });
  add(body, box(34, 18, 6, 2.5), m.backpackDark, { position: [0, 92, -43] });
  add(body, limb(9, 52), m.mat, { position: [0, 134, -29], rotation: [0, 0, 90] });

  return { body, legs: [legL, legR], arms: [armR, armL], pompom };
}

/**
 * Couleurs qui suivent le thème de la page : la neige et le pompon doivent
 * rester lisibles sur un fond clair, le drapeau reprend le balisage.
 * @param {HTMLElement} element
 * @returns {{ snow: string, flag: string, light: boolean }}
 */
function themeColors(element) {
  const style = getComputedStyle(element);
  const background = new Color(style.getPropertyValue('--canvas-soft').trim() || '#1b2023');
  const light = background.getHSL({ h: 0, s: 0, l: 0 }).l > 0.5;
  return { snow: light ? '#d9e0e4' : '#eef0ec', flag: style.getPropertyValue('--summit').trim() || '#f07a3e', light };
}

/**
 * Affiche le randonneur dans son emplacement de l'en-tête.
 * @param {HTMLElement} figure élément `[data-hiker]`, qui contient l'image fixe
 * @param {{ still?: boolean }} [options] `still` : une seule image, sans animation
 * @returns {{ renderer: WebGLRenderer, render: (time: number) => void }}
 */
export function mountHiker(figure, { still = false } = {}) {
  const materials = createMaterials();
  const scene = new Scene();
  const diorama = createDiorama(materials);
  const hiker = createHiker(materials);
  hiker.body.position.y = 3;
  scene.add(diorama.group, hiker.body);

  const sky = new HemisphereLight('#dde6ee', '#7a7468', 1.6);
  const sun = new DirectionalLight('#fff1e0', 2.4);
  sun.position.set(350, 600, 400);
  sun.target.position.set(0, 0, -40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.radius = 4;
  sun.shadow.bias = -0.0005;
  Object.assign(sun.shadow.camera, { left: -360, right: 360, top: 360, bottom: -360, near: 100, far: 1800 });
  scene.add(sky, sun, sun.target);

  const camera = new PerspectiveCamera(VIEW.fieldOfView, 4 / 3, 10, 5000);
  const elevation = VIEW.elevation * DEGREES;
  const azimuth = VIEW.azimuth * DEGREES;
  camera.position.set(
    VIEW.target.x + VIEW.distance * Math.cos(elevation) * Math.sin(azimuth),
    VIEW.target.y + VIEW.distance * Math.sin(elevation),
    VIEW.target.z + VIEW.distance * Math.cos(elevation) * Math.cos(azimuth),
  );
  camera.lookAt(VIEW.target);

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: still });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  figure.append(renderer.domElement);

  function readTheme() {
    const colors = themeColors(figure);
    materials.snow.color.set(colors.snow);
    materials.pompom.color.set(colors.light ? '#f6f5f1' : COLORS.pompom);
    materials.flag.color.set(colors.flag);
  }

  /**
   * Pose de la marche au temps donné. Le pas démarre en douceur depuis la
   * pose construite (s = 1), puis s suit un cosinus.
   * @param {number} seconds
   */
  function pose(seconds) {
    const ramp = Math.min(1, seconds / WALK.easeIn);
    const w = (2 * Math.PI) / WALK.period;
    const s = 1 - ramp + ramp * Math.cos(w * seconds);
    const [legL, legR] = hiker.legs;
    const [armR, armL] = hiker.arms;
    legL.rotation.x = (WALK.leg - WALK.leg * s) * DEGREES;
    legR.rotation.x = (-WALK.leg + WALK.leg * s) * DEGREES;
    armR.rotation.x = (WALK.arm - WALK.arm * s) * DEGREES;
    armL.rotation.x = (-WALK.arm + WALK.arm * s) * DEGREES;
    // Le corps monte quand les jambes passent sous lui, se penche un peu en avant et se balance.
    hiker.body.position.y = 3 + WALK.bounce * (1 - Math.abs(s));
    hiker.body.rotation.x = WALK.lean * ramp * DEGREES;
    hiker.body.rotation.z = WALK.sway * ramp * Math.sin(w * seconds) * DEGREES;
    hiker.pompom.position.y = 180 + 1.5 * ramp * Math.sin(2 * w * seconds - 1.2);
    diorama.flag.rotation.y = Math.sin(seconds * 3.1) * 14 * DEGREES;
    diorama.flag.scale.x = 1 + 0.06 * Math.sin(seconds * 5.3);
  }

  /** @param {number} time millisecondes depuis le début de l'animation */
  function render(time) {
    pose(time / 1000);
    renderer.render(scene, camera);
  }

  function resize() {
    const { clientWidth, clientHeight } = figure;
    if (!clientWidth || !clientHeight) return;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  }

  readTheme();
  resize();

  const reducedMotion = still || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = false;
  let frame = 0;
  let clock = 0; // temps d'animation cumulé, en millisecondes : l'animation reprend où elle s'était arrêtée
  let last = 0;

  /** Dessine une image ; en mouvement, demande la suivante tant que la scène est visible. */
  function tick(now) {
    frame = 0;
    if (!reducedMotion) {
      clock += Math.min(now - (last || now), 100);
      last = now;
    }
    render(clock);
    if (!reducedMotion && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }

  function start() {
    if (frame) return;
    last = 0;
    frame = requestAnimationFrame(tick);
  }

  function redraw() {
    readTheme();
    if (!frame) render(clock);
  }

  if (!still) {
    new ResizeObserver(() => {
      resize();
      if (!frame) render(clock);
    }).observe(figure);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    }).observe(figure);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && visible) start();
    });
    new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redraw);
  }

  render(clock);
  figure.classList.add('is-3d');
  return { renderer, render };
}
