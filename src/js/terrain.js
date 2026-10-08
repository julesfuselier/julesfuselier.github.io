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
 * change (rotation à la souris, survol d'un projet, redimensionnement,
 * changement de thème) ou pendant une courte animation.
 *
 * Deux animations, toutes deux désactivées si le visiteur a demandé moins
 * de mouvement (`prefers-reduced-motion`) :
 *  - à l'arrivée, le sentier se trace d'un sommet à l'autre, du plus ancien
 *    au plus récent ;
 *  - au survol (ou au focus clavier) d'un projet, la caméra s'approche de
 *    son sommet et les courbes de niveau autour de lui passent en couleur.
 */

import { BufferAttribute, Color, Mesh, PerspectiveCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer } from 'three';

import { CONTOUR_LEVELS, RELIEF_EXPONENT, contourScale, createHeightField } from '../lib/contours.mjs';
import { trailPath, trailPoints } from '../lib/trail.mjs';

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

/** Tracé du sentier à l'arrivée, après le basculement de la vue. */
const TRAIL_DRAW = { delay: 900, duration: 1800 };

/**
 * Mise en avant d'un sommet survolé : part du chemin parcourue par le
 * regard vers lui, recul de la caméra (1 = aucun), et vitesse de transition
 * (part de l'écart comblée à chaque image ; 0,12 donne environ un tiers de
 * seconde).
 */
const FOCUS = { pull: 0.35, zoom: 0.86, smoothing: 0.12 };

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
  uniform vec3 uAccent;      // couleur des sommets (terre cuite)
  uniform vec2 uFocus;       // sommet mis en avant, en coordonnées de texture
  uniform float uFocusAmount; // 0 sans mise en avant, 1 pleinement
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

    // Mise en avant : autour du sommet survolé, les courbes prennent la
    // couleur des sommets. Les distances sont ramenées aux proportions du
    // terrain (10 de large pour 4 de profondeur) pour former un cercle.
    float near = 1.0 - smoothstep(0.25, 0.9, length((vUv - uFocus) * vec2(10.0, 4.0)));
    vec3 lineColor = mix(uInk, uAccent, near * uFocusAmount);
    float focusedInk = min(1.0, ink * (1.0 + 0.6 * near * uFocusAmount));

    gl_FragColor = vec4(mix(ground, lineColor, focusedInk), edge.x * edge.y);
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
      uAccent: { value: new Color() },
      uFocus: { value: new Vector2() },
      uFocusAmount: { value: 0 },
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
  const view = { elevation: reducedMotion ? VIEW.endElevation : VIEW.startElevation, azimuth: 0, distance: VIEW.distance };
  const CENTER = new Vector3(0, 0.55, 0);
  const target = CENTER.clone(); // point regardé par la caméra
  let frame = 0;

  /** Reprend les couleurs du thème courant, définies en CSS. */
  function readColors() {
    const style = getComputedStyle(map);
    material.uniforms.uPaper.value.set(style.getPropertyValue('--canvas-soft').trim());
    material.uniforms.uInk.value.set(style.getPropertyValue('--body').trim());
    material.uniforms.uAccent.value.set(style.getPropertyValue('--summit').trim());
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
      view.distance * Math.cos(elevation) * Math.sin(azimuth),
      view.distance * Math.sin(elevation),
      view.distance * Math.cos(elevation) * Math.cos(azimuth),
    );
    camera.position.add(target).sub(CENTER); // la caméra suit le point regardé
    camera.lookAt(target);
  }

  /**
   * Position à l'écran d'un point de la carte, posé sur le terrain.
   * @param {number} x position sur la carte, de 0 à 1
   * @param {number} y position sur la carte, de 0 à 1
   * @returns {{ x: number, y: number }} position dans la carte, de 0 (bord gauche ou haut) à 1
   */
  function onScreen(x, y) {
    const row = Math.round(y * GRID.rows);
    const col = Math.round(x * GRID.cols);
    const point = new Vector3((x - 0.5) * TERRAIN.width, elevationOf(field[row][col]), (y - 0.5) * TERRAIN.depth).project(camera); // de -1 à 1
    return { x: (point.x + 1) / 2, y: (1 - point.y) / 2 };
  }

  /** Déplace chaque étiquette HTML au-dessus de son sommet, tel qu'il apparaît à l'écran. */
  function placeLabels() {
    const { clientWidth, clientHeight } = map;
    for (const summit of summits) {
      const point = onScreen(summit.x, summit.y);
      summit.element.style.setProperty('--x', `${point.x * clientWidth}px`);
      summit.element.style.setProperty('--y', `${point.y * clientHeight}px`);
    }
  }

  // Sentier : mêmes points que sur la carte 2D, replacés à chaque dessin là
  // où ils apparaissent sur le relief. Le SVG du sentier compte en pour-cent.
  const trail = map.querySelector('[data-trail]');
  const flatTrail = trail?.getAttribute('d');
  const trailOnMap = trailPoints([...summits].sort((a, b) => a.x - b.x)); // de gauche à droite, comme en 2D
  let trailProgress = reducedMotion ? 1 : 0; // part du sentier déjà tracée, de 0 à 1
  function placeTrail() {
    if (!trail) return;
    const projected = trailOnMap.map(({ x, y }) => onScreen(x, y));
    // Seuls les premiers points sont gardés ; le dernier est interpolé pour
    // que le trait avance sans à-coups.
    const reach = trailProgress * (projected.length - 1);
    const whole = Math.floor(reach);
    const visible = projected.slice(0, whole + 1);
    const next = projected[whole + 1];
    if (next) {
      const last = visible.at(-1);
      const part = reach - whole;
      visible.push({ x: last.x + (next.x - last.x) * part, y: last.y + (next.y - last.y) * part });
    }
    trail.setAttribute('d', visible.length > 1 ? trailPath(visible.map(({ x, y }) => ({ x: x * 100, y: y * 100 }))) : '');
  }

  // Tracé du sentier à l'arrivée.
  let trailStart = 0;
  function drawTrail(time) {
    trailStart ||= time;
    const progress = Math.min(Math.max(time - trailStart - TRAIL_DRAW.delay, 0) / TRAIL_DRAW.duration, 1);
    trailProgress = progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2; // accélère puis ralentit
    requestDraw();
    if (progress < 1 && mounted) requestAnimationFrame(drawTrail);
  }

  // Mise en avant d'un sommet : chaque valeur glisse vers sa cible, image
  // après image, tant qu'elle ne l'a pas atteinte. Un nouveau survol change
  // simplement la cible, ce qui rend l'animation interruptible.
  const focus = { amount: 0, toAmount: 0, x: 0, z: 0, toX: 0, toZ: 0 };
  let focusing = false;
  function stepFocus() {
    const ease = (value, goal) => value + (goal - value) * FOCUS.smoothing;
    focus.amount = ease(focus.amount, focus.toAmount);
    focus.x = ease(focus.x, focus.toX);
    focus.z = ease(focus.z, focus.toZ);
    material.uniforms.uFocusAmount.value = focus.amount;
    target.set(CENTER.x + focus.x * focus.amount, CENTER.y, CENTER.z + focus.z * focus.amount);
    view.distance = VIEW.distance * (1 - (1 - FOCUS.zoom) * focus.amount);
    requestDraw();
    const settled = Math.abs(focus.amount - focus.toAmount) < 0.002 && Math.abs(focus.x - focus.toX) < 0.002 && Math.abs(focus.z - focus.toZ) < 0.002;
    focusing = !settled;
    if (focusing && mounted) requestAnimationFrame(stepFocus);
  }

  /** @param {{ x: number, y: number } | null} summit sommet à mettre en avant, ou aucun */
  function setFocus(summit) {
    if (reducedMotion) return;
    focus.toAmount = summit ? 1 : 0;
    if (summit) {
      focus.toX = (summit.x - 0.5) * TERRAIN.width * FOCUS.pull;
      focus.toZ = (summit.y - 0.5) * TERRAIN.depth * FOCUS.pull;
      material.uniforms.uFocus.value.set(summit.x, 1 - summit.y); // la texture compte de bas en haut
    }
    if (!focusing) requestAnimationFrame(stepFocus);
  }

  const focusListeners = summits.map((summit) => {
    const enter = () => setFocus(summit);
    const leave = () => setFocus(null);
    for (const type of ['pointerenter', 'focusin']) summit.element.addEventListener(type, enter);
    for (const type of ['pointerleave', 'focusout']) summit.element.addEventListener(type, leave);
    return { summit, enter, leave };
  });

  function draw() {
    frame = 0;
    placeCamera();
    renderer.render(scene, camera);
    placeLabels();
    placeTrail();
  }

  let mounted = true; // faux une fois le relief retiré : plus aucun dessin

  /** Demande un nouveau dessin, au plus une fois par image affichée. */
  function requestDraw() {
    if (mounted && !frame) frame = requestAnimationFrame(draw);
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
    mounted = false;
    wide.removeEventListener('change', unmount);
    systemTheme.removeEventListener('change', onSystemTheme);
    resizeObserver.disconnect();
    themeObserver.disconnect();
    cancelAnimationFrame(frame);
    introDone = true;
    renderer.domElement.remove();
    renderer.dispose();
    map.classList.remove('is-3d', 'is-dragging');
    if (trail && flatTrail) trail.setAttribute('d', flatTrail);
    for (const { summit, enter, leave } of focusListeners) {
      for (const type of ['pointerenter', 'focusin']) summit.element.removeEventListener(type, enter);
      for (const type of ['pointerleave', 'focusout']) summit.element.removeEventListener(type, leave);
    }
    for (const summit of summits) {
      summit.element.style.setProperty('--x', `${summit.element.dataset.x}%`);
      summit.element.style.setProperty('--y', `${summit.element.dataset.y}%`);
    }
  }
  wide.addEventListener('change', unmount);

  readColors();
  resize();
  requestAnimationFrame(intro);
  if (!reducedMotion) requestAnimationFrame(drawTrail);
}
