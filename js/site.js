/**
 * Seul script exécuté dans le navigateur : le bouton de thème.
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
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  button.hidden = false;
  button.setAttribute('aria-pressed', String(currentTheme() === 'dark'));

  button.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    button.setAttribute('aria-pressed', String(next === 'dark'));
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Stockage indisponible (navigation privée) : le choix vaut pour cette page.
    }
  });
})();
