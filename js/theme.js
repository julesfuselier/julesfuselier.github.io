// js/theme.js

document.addEventListener('DOMContentLoaded', () => {
  const themeToggles = [
    document.getElementById('theme-toggle'),
    document.getElementById('theme-toggle-mobile')
  ];
  const html = document.documentElement;

  /**
   * Applique le thème (light ou dark) et met à jour l'UI.
   */
  function applyTheme(theme) {
    if (theme === 'dark') {
      html.classList.add('dark');
      themeToggles.forEach(btn => btn ? (btn.textContent = '☀️') : null);
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      themeToggles.forEach(btn => btn ? (btn.textContent = '🌗') : null);
      localStorage.setItem('theme', 'light');
    }
  }

  /**
   * Initialise le thème au chargement de la page.
   * Priorité : 1. localStorage, 2. Préférence Système (prefers-color-scheme)
   */
  function initTheme() {
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme) {
      applyTheme(storedTheme);
    } else if (systemPrefersDark) {
      applyTheme('dark');
    } else {
      applyTheme('light');
    }
  }

  /**
   * Inverse le thème actuel.
   */
  function toggleTheme() {
    const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }

  // Ajoute les écouteurs d'événements
  themeToggles.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', toggleTheme);
    }
  });

  // Lance l'initialisation
  initTheme();
});