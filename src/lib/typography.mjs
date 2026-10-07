/**
 * Typographie des textes affichés.
 *
 * Les fichiers de contenu s'écrivent au clavier, avec des apostrophes droites
 * et des espaces ordinaires. Cette passe applique à la compilation ce que la
 * typographie demande : apostrophes courbes, et en français des espaces
 * insécables avant la ponctuation double, pour qu'un « : » ne se retrouve
 * jamais seul en début de ligne.
 */

const NBSP = ' ';
const NARROW_NBSP = ' ';

/**
 * Corrige la typographie d'un texte.
 * @param {string} lang langue du texte (`fr` ou `en`)
 * @param {string} text
 * @returns {string}
 */
export function typeset(lang, text) {
  let out = text.replace(/'/g, '’');
  if (lang === 'fr') {
    out = out
      .replace(/ :/g, `${NBSP}:`)
      .replace(/ ([;!?])/g, `${NARROW_NBSP}$1`)
      .replace(/« /g, `«${NBSP}`)
      .replace(/ »/g, `${NBSP}»`);
  }
  return out;
}

/**
 * Applique `typeset` à toutes les chaînes d'un contenu, en profondeur.
 * @template T
 * @param {string} lang
 * @param {T} value
 * @returns {T}
 */
export function typesetDeep(lang, value) {
  if (typeof value === 'string') return /** @type {T} */ (typeset(lang, value));
  if (Array.isArray(value)) return /** @type {T} */ (value.map((item) => typesetDeep(lang, item)));
  if (value !== null && typeof value === 'object') {
    return /** @type {T} */ (Object.fromEntries(Object.entries(value).map(([key, item]) => [key, typesetDeep(lang, item)])));
  }
  return value;
}
