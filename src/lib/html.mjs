/**
 * Outils de génération HTML.
 *
 * Tout le contenu du site vient de fichiers JSON : il est donc échappé par
 * défaut. Seul le HTML produit par un gabarit (enveloppé dans `SafeHtml`)
 * est inséré tel quel.
 */

/** Fragment HTML déjà sûr, que `html` n'échappe pas une seconde fois. */
export class SafeHtml {
  /** @param {string} value */
  constructor(value) {
    this.value = value;
  }

  toString() {
    return this.value;
  }
}

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/**
 * Échappe une valeur pour l'insérer dans du HTML (texte ou attribut).
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ENTITIES[char]);
}

/**
 * Convertit une valeur interpolée en HTML : les fragments sûrs passent tels
 * quels, les tableaux sont concaténés, `null`/`undefined`/`false` sont ignorés,
 * tout le reste est échappé.
 * @param {unknown} value
 * @returns {string}
 */
function render(value) {
  if (value === null || value === undefined || value === false) return '';
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  return escapeHtml(value);
}

/**
 * Gabarit étiqueté : `html\`<p>${texte}</p>\`` échappe `texte` automatiquement.
 * @param {TemplateStringsArray} strings
 * @param {...unknown} values
 * @returns {SafeHtml}
 */
export function html(strings, ...values) {
  let out = strings[0];
  values.forEach((value, index) => {
    out += render(value) + strings[index + 1];
  });
  return new SafeHtml(out);
}

/**
 * Marque une chaîne comme HTML sûr. À réserver au HTML produit par le code,
 * jamais au contenu rédigé.
 * @param {string} value
 * @returns {SafeHtml}
 */
export function raw(value) {
  return new SafeHtml(value);
}
