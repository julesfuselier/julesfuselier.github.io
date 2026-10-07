/**
 * Configuration Tailwind.
 *
 * Les couleurs pointent vers des variables CSS (définies dans
 * `src/styles/main.css`) : le thème sombre ne demande aucune classe `dark:`.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  // Les classes sont écrites dans les gabarits, pas dans le HTML généré.
  content: ['./src/templates/**/*.mjs'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        link: 'var(--link)',
        summit: 'var(--summit)',
        button: 'var(--button)',
        'button-ink': 'var(--button-ink)',
        band: 'var(--band)',
        'band-ink': 'var(--band-ink)',
        'band-muted': 'var(--band-muted)',
        'band-line': 'var(--band-line)',
      },
      fontFamily: {
        sans: ['"Space Grotesk Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        page: '72rem',
      },
    },
  },
  plugins: [],
};
