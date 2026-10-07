# julesfuselier.fr

Portfolio de Jules Fuselier. Site statique, pré-rendu en français et en anglais, publié par GitHub Pages depuis la racine de ce dépôt.

Il s'adresse à deux publics : les recruteurs (stage ingénieur) et les clients de la micro-entreprise.

## Démarrer

Node.js 20 ou plus récent.

```bash
npm install
npm run dev     # compile, sert http://localhost:8080 et recompile à chaque modification de src/
npm test        # tests du contenu, du générateur de cartes et des pages
npm run build   # compile le site avant de committer
```

## Principe

Le contenu est séparé de la présentation :

```
src/content/*.json  ──┐
                      ├──►  scripts/build.mjs  ──►  pages HTML, cartes SVG, CSS
src/templates/*.mjs ──┘
```

Chaque page est écrite en HTML complet à la compilation. Le navigateur ne reconstruit rien : le site se lit sans JavaScript, et les moteurs de recherche voient tout le texte. Le seul script livré (`js/site.js`) gère le bouton de thème.

## Organisation

| Chemin | Rôle |
|---|---|
| `src/content/site.json` | Données communes aux deux langues : adresses, liens, technologies, position des projets sur la carte |
| `src/content/fr.json`, `en.json` | Textes. Les deux fichiers ont exactement la même structure |
| `src/lib/content.mjs` | Chargement et validation du contenu |
| `src/lib/contours.mjs` | Génération des cartes topographiques (bruit, marching squares) |
| `src/lib/html.mjs` | Gabarit étiqueté `html` qui échappe le contenu par défaut |
| `src/lib/routes.mjs` | Adresse de chaque page, par langue |
| `src/templates/` | Gabarits : enveloppe commune, accueil, projet, pages simples |
| `src/styles/main.css` | Couleurs, polices et composants CSS. Compilé par Tailwind |
| `src/js/site.js` | Bouton de thème |
| `scripts/build.mjs` | Compilation |
| `scripts/dev.mjs` | Serveur de développement |
| `tests/` | Tests (`node:test`, sans dépendance) |

### Fichiers générés

GitHub Pages sert la racine du dépôt, donc le résultat de la compilation y est versionné. **Ne modifiez pas ces fichiers à la main**, ils sont réécrits à chaque `npm run build` :

`index.html`, `404.html`, `projects.html`, `project-detail.html`, `sitemap.xml`, `en/`, `projets/`, `mentions-legales/`, `css/style.css`, `js/site.js`, `assets/contours/`, `assets/fonts/`.

`projects.html` et `project-detail.html` sont les adresses de l'ancien site : elles redirigent vers la liste des projets.

## Modifier le contenu

### Changer un texte

Modifiez la clé dans `src/content/fr.json` **et** dans `src/content/en.json`, puis `npm run build`. Si une clé manque dans une langue, la compilation et les tests échouent en nommant la clé.

### Ajouter un projet

1. Dans `src/content/site.json` : ajoutez l'identifiant à `projectOrder` (l'ordre d'affichage) et une entrée dans `projects` avec `stack`, `links` et `summit` (position du sommet sur la carte de l'accueil, en pourcentage).
2. Dans `fr.json` et `en.json` : ajoutez les textes sous `projects.items.<identifiant>`. Champs obligatoires : `shortTitle`, `title`, `kicker`, `summary`, `context`, `role`, `actions`, `outcome`. `period` et `next` peuvent valoir `null`.
3. `npm run build`. La page du projet, sa carte, le lien sur la carte de l'accueil et le plan du site sont créés automatiquement.

Types de liens acceptés : `site`, `github`, `install`, `demo`. Leurs libellés sont dans `projects.linkLabels`.

### Mettre à jour le CV

Remplacez `assets/CV_FUSELIER-Jules.pdf` en gardant le même nom.

## Design

- **Palette « Dolomites »** : pierre `#D8D6CE` (fond), forêt `#3C4A3A` (boutons, section entreprises), terre cuite `#B75B39` (repères de sommet), rose `#D9A398` (liens en thème sombre). Les couleurs sont des variables CSS dans `src/styles/main.css` ; le thème sombre redéfinit ces variables, sans classe supplémentaire dans les gabarits.
- **Polices** : Space Grotesk pour le texte, JetBrains Mono pour les données courtes (technologies, périodes). Elles sont copiées depuis `node_modules` : aucune requête vers un service tiers.
- **Cartes topographiques** : calculées à la compilation à partir de l'identifiant du projet. Le même identifiant donne toujours la même carte. Sur l'accueil, chaque sommet est un lien vers un projet.

## Règles de contribution

- Aucun chiffre ni fait qui ne soit vérifiable : ce qui n'est pas livré est dit comme tel (champ `next` des projets).
- Tout texte passe par les fichiers de contenu, jamais en dur dans un gabarit.
- Le contenu est échappé par défaut. `raw()` est réservé au HTML produit par le code.
- Une fonction, une responsabilité, avec un commentaire JSDoc qui dit pourquoi elle existe.
- `npm test` et `npm run build` avant chaque commit. L'intégration continue (`.github/workflows/ci.yml`) rejoue les deux.

## À compléter

La compilation affiche un avertissement tant que ces points restent ouverts :

- `publisher.siret` dans `site.json`, pour des mentions légales complètes ;
- les technologies du projet Preity India (`projects.preity-india.stack`).
