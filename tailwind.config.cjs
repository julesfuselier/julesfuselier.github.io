/**
 * Configuration Tailwind.
 *
 * Les couleurs pointent vers des variables CSS (définies dans
 * `src/styles/main.css`) : le thème sombre ne demande aucune classe `dark:`.
 * Les rôles et les valeurs sont décrits dans `DESIGN.md`.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  // Les classes sont écrites dans les gabarits, pas dans le HTML généré.
  content: ['./src/templates/**/*.mjs', './src/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas)',
        'canvas-soft': 'var(--canvas-soft)',
        ink: 'var(--ink)',
        body: 'var(--body)',
        hairline: 'var(--hairline)',
        primary: 'var(--primary)',
        'on-primary': 'var(--on-primary)',
        summit: 'var(--summit)',
      },
      fontFamily: {
        sans: ['"Hanken Grotesk Variable"', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', '"Arial Narrow"', 'sans-serif-condensed', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        page: '77.5rem',
      },
    },
  },
  // Les survols `hover:` ne s'appliquent qu'avec une souris : sur écran tactile,
  // un survol simulé resterait collé après le toucher.
  future: { hoverOnlyWhenSupported: true },
  plugins: [],
};
