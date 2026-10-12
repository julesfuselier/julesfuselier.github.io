/**
 * Étape atteinte par chaque projet, et hauteur de son sommet sur la carte.
 *
 * Un sommet ne mesure pas le temps passé sur un projet mais jusqu'où il est
 * allé : de l'exploration jusqu'à l'outil utilisé pour de vrai. C'est un
 * critère vérifiable, que chaque fiche de projet justifie, et il met en avant
 * ce qu'un lecteur veut savoir : le projet a-t-il abouti ?
 *
 * L'étape se règle dans `site.json` (champ `stage` de chaque projet) ; son
 * libellé est dans les fichiers de langue (`projects.stages`).
 */

/** Étapes, de la plus basse à la plus haute, avec la hauteur relative du sommet. */
export const STAGES = {
  exploration: 0.35,
  prototype: 0.55,
  delivered: 0.78,
  'in-service': 1,
};

/** Étape à partir de laquelle un sommet porte un drapeau : utilisé par de vraies personnes. */
export const FLAG_STAGE = 'in-service';

/**
 * @param {unknown} stage
 * @returns {stage is keyof typeof STAGES} vrai si l'étape est connue
 */
export function isStage(stage) {
  return typeof stage === 'string' && Object.hasOwn(STAGES, stage);
}

/**
 * Hauteur relative d'un sommet, pour le dessin.
 * @param {string} stage étape du projet
 * @returns {number} entre 0 et 1 ; une étape inconnue donne la plus basse
 */
export function stageHeight(stage) {
  return isStage(stage) ? STAGES[stage] : STAGES.exploration;
}
