/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. On dit à Tailwind qu'on gère le Dark Mode avec une classe
  darkMode: 'class',

  // 2. On lui dit où chercher les classes Tailwind à garder
  content: [
    "./*.html",    // Scanne tous tes fichiers .html
    "./js/*.js"     // Scanne TOUS tes fichiers .js (pour les classes ajoutées dynamiquement)
  ],

  // 3. On apprend à Tailwind tes couleurs persos de style.css
  theme: {
    extend: {
      colors: {
        // J'ai repris les variables de ton css/style.css
        'background': 'var(--background)',
        'foreground': 'var(--foreground)',
        'card': 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        'muted': 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        'border': 'var(--border)',
        'accent': {
          DEFAULT: 'var(--accent)',
          'hover': 'var(--accent-hover)',
          // J'ai déduit celle-ci de ton HTML (bg-accent + text-accent-foreground)
          'foreground': 'var(--card-foreground)',
        },
      }
    },
  },
  plugins: [],
}