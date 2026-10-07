/**
 * Relief 3D de la carte des projets, avec Three.js.
 *
 * Ce fichier remplace le fond de la carte 2D par le même relief vu en
 * perspective. Les étiquettes des projets restent les liens HTML d'origine :
 * on se contente de les déplacer pour qu'elles suivent leur sommet.
 *
 * Petit lexique Three.js, pour qui n'en a jamais fait :
 *  - `Scene`     : le monde 3D, ici une seule surface ;
 *  - `Camera`    : le point de vue ;
 *  - `Renderer`  : dessine la scène vue par la caméra dans un `<canvas>` ;
 *  - `Geometry`  : la forme (une grille de points) ;
 *  - `Material`  : l'apparence de la forme. Ici un « shader », un petit
 *    programme exécuté par la carte graphique pour chaque pixel, qui trace
 *    les courbes de niveau.
 *
 * Rien ne tourne en boucle : une image n'est redessinée que si quelque chose
 * change (rotation à la souris, redimensionnement, changement de thème).
 */

import { BufferAttribute, Color, Mesh, PerspectiveCamera, PlaneGeometry, Scene, ShaderMaterial, Vector3, WebGLRenderer } from 'three';

import { CONTOUR_LEVELS, RELIEF_EXPONENT, contourScale, createHeightField } from '../lib/contours.mjs';

/** Dimensions du terrain dans le monde 3D : mêmes proportions que la carte 2D (5:2). */
const TERRAIN = { width: 10, depth: 4, height: 2.3 };

/** Finesse de la grille. Plus elle est fine, plus les courbes sont lisses. */
const GRID = { cols: 360, rows: 144 };

/** Point de vue : angle d'ouverture, distance, hauteur finale et rotation permise. */
const VIEW = {
  fieldOfView: 26,
  distance: 9.3,
  startElevation: 89, // presque à la verticale : identique à la carte 2D
  endElevation: 44,
  maxAzimuth: 22,
  introDuration: 1400,
};

const DEGREES = Math.PI / 180;

/**
 * Programme exécuté pour chaque point de la grille : il transmet l'altitude
 * et la position sur la carte au programme des pixels.
 */
const VERTEX_SHADER = /* glsl */ `
  attribute float aHeight;
  varying float vHeight;
  varying float vLight;
  varying float vSlope;
  varying vec2 vUv;

  // Direction d'où vient la lumière : en haut à gauche, comme sur une carte.
  const vec3 LIGHT = normalize(vec3(-0.5, 0.8, -0.35));

  void main() {
    vHeight = aHeight;
    vLight = clamp(dot(normal, LIGHT), 0.0, 1.0);
    vSlope = 1.0 - normal.y; // 0 à plat, proche de 1 sur une paroi
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Programme exécuté pour chaque pixel : il colore en « encre » les pixels
 * proches d'une courbe de niveau, en « papier » les autres. `fwidth` mesure
 * la variation d'une valeur d'un pixel au suivant, ce qui donne des traits
 * d'épaisseur constante à l'écran quelle que soit la pente.
 */
const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uPaper;
  uniform vec3 uInk;
  uniform float uBase;
  uniform float uStep;
  uniform float uLevels;
  uniform float uShadeLit; // 1 si l'encre est plus claire que le papier (thème sombre)
  uniform float uShadeStrength;
  varying float vHeight;
  varying float vLight;
  varying float vSlope;
  varying vec2 vUv;

  // Intensité (0 à 1) d'un trait placé sur chaque valeur entière de f.
  float lineAt(float f, float width) {
    float distanceInPixels = abs(fract(f - 0.5) - 0.5) / max(fwidth(f), 0.00001);
    return 1.0 - smoothstep(width - 0.5, width + 0.5, distanceInPixels);
  }

  void main() {
    float level = (vHeight - uBase) / uStep;
    float inRange = step(0.5, level) * step(level, uLevels + 0.5);
    float minor = lineAt(level, 0.6) * 0.45;
    float major = lineAt(level / 4.0, 1.0) * 0.7; // une courbe maîtresse sur quatre
    float ink = max(minor, major) * inRange;

    // Les bords s'estompent pour que le terrain se fonde dans la page.
    vec2 edge = smoothstep(0.0, 0.12, vUv) * smoothstep(0.0, 0.12, 1.0 - vUv);

    // Ombrage : les versants à l'ombre tirent vers l'encre en thème clair ;
    // en thème sombre, ce sont les versants éclairés qui s'éclaircissent.
    // Les parois raides sont assombries en plus, comme la roche nue.
    float shade = mix(1.0 - vLight, vLight, uShadeLit) * uShadeStrength;
    float rock = smoothstep(0.25, 0.7, vSlope) * uShadeStrength * 0.6 * (1.0 - uShadeLit);
    vec3 ground = mix(uPaper, uInk, min(shade + rock, 0.75));

    gl_FragColor = vec4(mix(ground, uInk, ink), edge.x * edge.y);
    #include <colorspace_fragment>
  }
`;

/**
 * Lit les sommets dans le HTML de la carte.
 * @param {HTMLElement} map
 * @returns {{ element: HTMLElement, x: number, y: number, height: number }[]} positions et hauteurs de 0 à 1
 */
function readSummits(map) {
  return [...map.querySelectorAll('[data-summit]')].map((element) => ({
    element,
    x: Number(element.dataset.x) / 100,
    y: Number(element.dataset.y) / 100,
    height: Number(element.dataset.height),
  }));
}

/**
 * Hauteur dans le monde 3D d'un point d'altitude donnée.
 * @param {number} altitude de 0 à 1
 * @returns {number}
 */
function elevationOf(altitude) {
  return altitude ** RELIEF_EXPONENT * TERRAIN.height;
}

/**
 * Construit la surface du terrain : une grille plane dont chaque point est
 * soulevé à l'altitude donnée par le champ partagé avec la carte 2D.
 * @param {number[][]} field altitudes de 0 à 1
 * @returns {PlaneGeometry}
 */
function createTerrainGeometry(field) {
  const geometry = new PlaneGeometry(TERRAIN.width, TERRAIN.depth, GRID.cols, GRID.rows);
  geometry.rotateX(-90 * DEGREES); // la grille est créée debout : on la couche

  const positions = geometry.attributes.position;
  const heights = new Float32Array(positions.count);
  for (let row = 0; row <= GRID.rows; row += 1) {
    for (let col = 0; col <= GRID.cols; col += 1) {
      const index = row * (GRID.cols + 1) + col;
      heights[index] = field[row][col];
      positions.setY(index, elevationOf(field[row][col]));
    }
  }
  geometry.setAttribute('aHeight', new BufferAttribute(heights, 1));
  geometry.computeVertexNormals(); // orientation de chaque facette, pour l'ombrage
  return geometry;
}

/**
 * Affiche le relief 3D dans la carte des projets.
 * @param {HTMLElement} map élément `[data-project-map]`
 * @param {MediaQueryList} wide vrai tant que l'écran est assez large pour le relief
 */
export function mountTerrain(map, wide) {
  const summits = readSummits(map);
  const field = createHeightField({ seed: map.dataset.seed, peaks: summits, ...GRID });
  const { base, step } = contourScale(CONTOUR_LEVELS);

  const material = new ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    uniforms: {
      uPaper: { value: new Color() },
      uInk: { value: new Color() },
      uBase: { value: base },
      uStep: { value: step },
      uLevels: { value: CONTOUR_LEVELS },
      uShadeLit: { value: 0 },
      uShadeStrength: { value: 0 },
    },
  });
  const scene = new Scene();
  scene.add(new Mesh(createTerrainGeometry(field), material));

  const camera = new PerspectiveCamera(VIEW.fieldOfView, 1, 0.1, 100);
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  map.prepend(renderer.domElement);
  map.classList.add('is-3d');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const view = { elevation: reducedMotion ? VIEW.endElevation : VIEW.startElevation, azimuth: 0 };
  const target = new Vector3(0, 0.55, 0);
  let frame = 0;

  /** Reprend les couleurs du thème courant, définies en CSS. */
  function readColors() {
    const style = getComputedStyle(map);
    material.uniforms.uPaper.value.set(style.getPropertyValue('--canvas-soft').trim());
    material.uniforms.uInk.value.set(style.getPropertyValue('--body').trim());
    const lightness = (color) => color.getHSL({}).l;
    const darkTheme = lightness(material.uniforms.uInk.value) > lightness(material.uniforms.uPaper.value);
    material.uniforms.uShadeLit.value = darkTheme ? 1 : 0;
    material.uniforms.uShadeStrength.value = darkTheme ? 0.16 : 0.42;
  }

  /** Place la caméra sur une sphère autour du terrain, tournée vers son centre. */
  function placeCamera() {
    const elevation = view.elevation * DEGREES;
    const azimuth = view.azimuth * DEGREES;
    camera.position.set(
      VIEW.distance * Math.cos(elevation) * Math.sin(azimuth),
      VIEW.distance * Math.sin(elevation),
      VIEW.distance * Math.cos(elevation) * Math.cos(azimuth),
    );
    camera.lookAt(target);
  }

  /** Déplace chaque étiquette HTML au-dessus de son sommet, tel qu'il apparaît à l'écran. */
  function placeLabels() {
    const { clientWidth, clientHeight } = map;
    for (const summit of summits) {
      const row = Math.round(summit.y * GRID.rows);
      const col = Math.round(summit.x * GRID.cols);
      const point = new Vector3(
        (summit.x - 0.5) * TERRAIN.width,
        elevationOf(field[row][col]),
        (summit.y - 0.5) * TERRAIN.depth,
      ).project(camera); // coordonnées écran, de -1 à 1
      summit.element.style.setProperty('--x', `${((point.x + 1) / 2) * clientWidth}px`);
      summit.element.style.setProperty('--y', `${((1 - point.y) / 2) * clientHeight}px`);
    }
  }

  function draw() {
    frame = 0;
    placeCamera();
    renderer.render(scene, camera);
    placeLabels();
  }

  /** Demande un nouveau dessin, au plus une fois par image affichée. */
  function requestDraw() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function resize() {
    const { clientWidth, clientHeight } = map;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    requestDraw();
  }

  // Entrée : la vue bascule de la verticale (la carte 2D) vers la perspective.
  // Un glissement de la souris l'interrompt aussitôt.
  let introStart = 0;
  let introDone = reducedMotion;
  function intro(time) {
    if (introDone) return;
    introStart ||= time;
    const progress = Math.min((time - introStart) / VIEW.introDuration, 1);
    const eased = 1 - (1 - progress) ** 3;
    view.elevation = VIEW.startElevation + (VIEW.endElevation - VIEW.startElevation) * eased;
    requestDraw();
    if (progress < 1) requestAnimationFrame(intro);
    else introDone = true;
  }

  // Rotation : glisser horizontalement fait tourner le terrain.
  let dragFrom = null;
  renderer.domElement.addEventListener('pointerdown', (event) => {
    introDone = true;
    view.elevation = VIEW.endElevation;
    dragFrom = { x: event.clientX, azimuth: view.azimuth };
    renderer.domElement.setPointerCapture(event.pointerId);
    map.classList.add('is-dragging');
  });
  renderer.domElement.addEventListener('pointermove', (event) => {
    if (!dragFrom) return;
    const turned = dragFrom.azimuth - ((event.clientX - dragFrom.x) / map.clientWidth) * 90;
    view.azimuth = Math.max(-VIEW.maxAzimuth, Math.min(VIEW.maxAzimuth, turned));
    requestDraw();
  });
  const endDrag = () => {
    dragFrom = null;
    map.classList.remove('is-dragging');
  };
  renderer.domElement.addEventListener('pointerup', endDrag);
  renderer.domElement.addEventListener('pointercancel', endDrag);

  // Le relief suit la taille de la carte et le thème clair ou sombre.
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(map);
  const themeObserver = new MutationObserver(() => {
    readColors();
    requestDraw();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const onSystemTheme = () => {
    readColors();
    requestDraw();
  };
  systemTheme.addEventListener('change', onSystemTheme);

  /** Rend la main à la carte 2D : écran devenu trop étroit. */
  function unmount() {
    if (wide.matches) return;
    wide.removeEventListener('change', unmount);
    systemTheme.removeEventListener('change', onSystemTheme);
    resizeObserver.disconnect();
    themeObserver.disconnect();
    cancelAnimationFrame(frame);
    introDone = true;
    renderer.domElement.remove();
    renderer.dispose();
    map.classList.remove('is-3d', 'is-dragging');
    for (const summit of summits) {
      summit.element.style.setProperty('--x', `${summit.element.dataset.x}%`);
      summit.element.style.setProperty('--y', `${summit.element.dataset.y}%`);
    }
  }
  wide.addEventListener('change', unmount);

  readColors();
  resize();
  requestAnimationFrame(intro);
}
