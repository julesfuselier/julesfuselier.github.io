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
        contour: 'var(--contour)',
        band: 'var(--band)',
        'band-card': 'var(--band-card)',
        'band-ink': 'var(--band-ink)',
        'band-body': 'var(--band-body)',
        'band-hairline': 'var(--band-hairline)',
      },
      fontFamily: {
        sans: ['"Inter Tight Variable"', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces Variable"', 'Georgia', 'serif'],
      },
      maxWidth: {
        page: '75rem',
      },
    },
  },
  plugins: [],
};
