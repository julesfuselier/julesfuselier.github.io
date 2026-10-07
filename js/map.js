/**
 * Chargeur du relief 3D.
 *
 * La carte des projets existe d'abord en 2D, sans JavaScript. Ce petit module
 * décide si le navigateur peut afficher mieux, et ne télécharge Three.js
 * (le fichier lourd, `terrain.js`) que dans ce cas :
 *  - écran assez large : sur mobile, la carte 2D carrée reste plus lisible ;
 *  - WebGL 2 disponible ;
 *  - le visiteur n'a pas demandé d'économiser ses données.
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

const map = document.querySelector('[data-project-map]');
const wide = window.matchMedia(WIDE_SCREEN);
const saveData = navigator.connection?.saveData === true;

if (map && wide.matches && !saveData && supportsWebGL()) {
  import('./terrain.js')
    .then(({ mountTerrain }) => mountTerrain(map, wide))
    .catch(() => {
      // Le relief est un supplément : en cas d'échec, la carte 2D reste affichée.
    });
}
