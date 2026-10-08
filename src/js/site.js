/**
 * Bouton de thème clair ou sombre.
 *
 * Le site fonctionne entièrement sans JavaScript. Le bouton est masqué dans
 * le HTML (`hidden`) et n'apparaît que si ce script s'exécute.
 *
 * Le thème initial est appliqué plus tôt, par un court script en ligne dans
 * `<head>` (voir `src/templates/layout.mjs`), pour éviter un flash au chargement.
 */
(() => {
  const STORAGE_KEY = 'theme';
  const root = document.documentElement;
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return;

  /** @returns {'light' | 'dark'} thème actuellement affiché */
  const currentTheme = () => {
    return root.dataset.theme === 'light' ? 'light' : 'dark'; // sombre par défaut
  };

  /**
   * Aligne la couleur de la barre du navigateur (mobile) sur le fond de la
   * page. Sans cela, elle suivrait le thème du système même après un choix
   * manuel du visiteur.
   */
  const syncThemeColor = () => {
    const background = getComputedStyle(root).getPropertyValue('--canvas-soft').trim();
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
      meta.setAttribute('content', background);
    }
  };

  button.hidden = false;
  button.setAttribute('aria-pressed', String(currentTheme() === 'dark'));
  if (root.dataset.theme) syncThemeColor();

  button.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    button.setAttribute('aria-pressed', String(next === 'dark'));
    syncThemeColor();
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Stockage indisponible (navigation privée) : le choix vaut pour cette page.
    }
  });
})();
