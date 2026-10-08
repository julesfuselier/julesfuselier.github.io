# julesfuselier.fr

Portfolio de Jules Fuselier. Site statique, pré-rendu en français et en anglais, publié par GitHub Pages depuis la racine de ce dépôt.

Il s'adresse à deux publics : les recruteurs (stage ingénieur) et les clients de la micro-entreprise.

## Démarrer

Node.js 20 ou plus récent.

```bash
npm install
npm run dev     # compile, sert http://localhost:8080 et recompile à chaque modification de src/
npm test        # tests du contenu, de la carte et des pages
npm run build   # compile le site avant de committer
```

## Principe

Le contenu est séparé de la présentation :

```
src/content/*.json  ──┐
                      ├──►  scripts/build.mjs  ──►  pages HTML, cartes SVG, CSS
src/templates/*.mjs ──┘
```

Chaque page est écrite en HTML complet à la compilation. Le navigateur ne reconstruit rien : le site se lit sans JavaScript, et les moteurs de recherche voient tout le texte. Deux scripts s'ajoutent en supplément : `js/site.js` (bouton de thème) et `js/map.js` (relief 3D, voir plus bas).

## Organisation

| Chemin | Rôle |
|---|---|
| `src/content/site.json` | Données communes aux deux langues : adresses, liens, technologies, position des projets sur la carte |
| `src/content/fr.json`, `en.json` | Textes. Les deux fichiers ont exactement la même structure |
| `src/lib/content.mjs` | Chargement et validation du contenu |
| `src/lib/contours.mjs` | Relief et courbes de niveau de la carte (bruit, marching squares). Utilisé à la compilation et par le relief 3D |
| `src/lib/typography.mjs` | Apostrophes courbes et espaces insécables, appliqués aux textes à la compilation |
| `src/lib/html.mjs` | Gabarit étiqueté `html` qui échappe le contenu par défaut |
| `src/lib/routes.mjs` | Adresse de chaque page, par langue |
| `src/templates/` | Gabarits : enveloppe commune, accueil, projet, pages simples |
| `src/styles/main.css` | Couleurs, polices et composants CSS. Compilé par Tailwind |
| `src/js/site.js` | Bouton de thème |
| `src/lib/altitude.mjs` | Calcule l'altitude de chaque sommet à partir des heures passées |
| `src/js/map.js` | Décide si le relief 3D peut s'afficher, et ne le télécharge que dans ce cas |
| `src/js/terrain.js` | Relief 3D de la carte des projets (Three.js), commenté pour qui découvre Three.js |
| `scripts/build.mjs` | Compilation |
| `scripts/dev.mjs` | Serveur de développement |
| `tests/` | Tests (`node:test`, sans dépendance) |

### Fichiers générés

GitHub Pages sert la racine du dépôt, donc le résultat de la compilation y est versionné. **Ne modifiez pas ces fichiers à la main**, ils sont réécrits à chaque `npm run build` :

`index.html`, `404.html`, `projects.html`, `project-detail.html`, `sitemap.xml`, `en/`, `projets/`, `mentions-legales/`, `css/style.css`, `js/`, `assets/contours/`, `assets/fonts/`.

`projects.html` et `project-detail.html` sont les adresses de l'ancien site : elles redirigent vers la liste des projets.

## Modifier le contenu

### Changer un texte

Modifiez la clé dans `src/content/fr.json` **et** dans `src/content/en.json`, puis `npm run build`. Si une clé manque dans une langue, la compilation et les tests échouent en nommant la clé.

### Ajouter un projet

1. Dans `src/content/site.json` : ajoutez l'identifiant à `projectOrder` (l'ordre d'affichage) et une entrée dans `projects` avec `stack`, `links` et `summit` (position du sommet sur la carte de l'accueil, en pourcentage).
2. Dans `fr.json` et `en.json` : ajoutez les textes sous `projects.items.<identifiant>`. Champs obligatoires : `shortTitle`, `title`, `kicker`, `summary`, `context`, `role`, `actions`, `outcome`. `period` et `next` peuvent valoir `null`.
3. `npm run build`. La page du projet, son sommet sur la carte et le plan du site sont créés automatiquement.

Types de liens acceptés : `site`, `github`, `install`, `demo`. Leurs libellés sont dans `projects.linkLabels`.

### Mettre à jour le CV

Remplacez `assets/CV_FUSELIER-Jules.pdf` en gardant le même nom.

## Design

Les règles visuelles complètes sont dans [`DESIGN.md`](DESIGN.md). En résumé :

- **Palette de carte topographique** : papier pierre `#D8D6CE`, forêt `#3C4A3A` (boutons, section entreprises), courbes de niveau brunes `#84674A`, rouge balisage `#A62A21` (sentier, focus). Les couleurs sont des variables CSS dans `src/styles/main.css` ; le thème sombre redéfinit ces variables, sans classe supplémentaire dans les gabarits. Détail des rôles dans `DESIGN.md`.
- **Police** : Archivo, une seule famille à largeur variable, copiée depuis `node_modules` : aucune requête vers un service tiers.
- **Images de partage** : chaque page de projet a sa propre image (`assets/img/og/`), générée par `scripts/og_images.py` (Python et Playwright). À relancer quand un titre de projet change.
- **Carte topographique** : une seule carte, calculée à la compilation, où chaque sommet est un projet (positions dans `site.json`, champ `summit`). Chaque sommet est un lien ; sur une page de projet, la carte mène aux autres projets.
- **Relief 3D** : sur un écran d'au moins 640 px, si le navigateur gère WebGL 2, `map.js` télécharge `terrain.js` (Three.js, environ 135 Ko compressé) et remplace le fond de la carte par le même relief en perspective. On peut le faire tourner en glissant. Les étiquettes restent les liens HTML d'origine. Sans WebGL, sur mobile ou en économie de données, la carte 2D reste affichée.
- **Hauteur des sommets** : elle dépend des heures passées sur chaque projet (champ `hours` de `src/content/site.json`), sur une échelle logarithmique entre 820 m et 2 650 m. La formule est dans `src/lib/altitude.mjs`. Tant qu'il manque les heures d'un projet, tous les sommets ont la même hauteur et la compilation le signale.
- **Relevé automatique des heures** : dans `site.json`, chaque projet liste ses dépôts GitHub sous `repos`. `npm run wakatime` interroge WakaTime avec le nom de chaque dépôt (c'est le nom que WakaTime donne au projet) et additionne les heures. Si un projet porte un autre nom dans WakaTime, le champ `wakatime` le précise. Le workflow `.github/workflows/wakatime.yml` fait ce relevé chaque lundi avec le secret `WAKATIME_API_KEY`, recompile et publie. `npm run wakatime -- --list` affiche les noms de projets du compte. Un projet sans dépôt garde des heures saisies à la main, et `untrackedHours` ajoute au relevé une estimation des heures passées hors de WakaTime.

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
