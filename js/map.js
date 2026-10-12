/**
 * Chargeur des scènes 3D.
 *
 * Le site existe d'abord sans JavaScript : une image fixe pour le randonneur
 * de l'en-tête, une carte 2D pour les projets. Ce petit module décide si le
 * navigateur peut afficher mieux, et ne télécharge Three.js (les fichiers
 * lourds) que dans ce cas :
 *  - WebGL 2 disponible ;
 *  - le visiteur n'a pas demandé d'économiser ses données ;
 *  - pour le relief de la carte seulement : écran assez large, car sur mobile
 *    la carte 2D carrée reste plus lisible.
 *
 * Les deux scènes partagent le même Three.js (voir `scripts/build.mjs`) : il
 * n'est téléchargé qu'une fois.
 */

/** Largeur à partir de laquelle la carte passe au format panoramique (voir main.css). */
const WIDE_SCREEN = '(min-width: 640px)';

/** @returns {boolean} vrai si le navigateur sait afficher du WebGL 2 */
function supportsWebGL() {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

const saveData = navigator.connection?.saveData === true;

if (!saveData && supportsWebGL()) {
  // Les scènes sont des suppléments : en cas d'échec, l'image fixe et la
  // carte 2D restent affichées.
  const hiker = document.querySelector('[data-hiker]');
  if (hiker) {
    import('./hiker.js')
      .then(({ mountHiker }) => mountHiker(hiker))
      .catch(() => {});
  }

  const map = document.querySelector('[data-project-map]');
  const wide = window.matchMedia(WIDE_SCREEN);
  if (map && wide.matches) {
    import('./terrain.js')
      .then(({ mountTerrain }) => mountTerrain(map, wide))
      .catch(() => {});
  }
}
