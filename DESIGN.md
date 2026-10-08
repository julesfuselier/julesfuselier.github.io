# DESIGN.md

Système visuel de julesfuselier.fr. Ce fichier sert de référence à toute personne, ou tout agent, qui modifie l'interface. Les valeurs vivent dans `src/styles/main.css` ; ce document explique les rôles et les règles.

## Vue d'ensemble

Un portfolio de développeur pour deux publics : des recruteurs et des clients. Le site emprunte son vocabulaire aux cartes topographiques de montagne : papier couleur pierre, courbes de niveau brunes, sommets cotés par un triangle noir, sentier balisé en rouge, noms lettrés étroits comme des toponymes. Ce vocabulaire n'apparaît qu'à un endroit, la carte des projets ; le reste de la page reste sobre et typographique.

Les choix évitent volontairement les motifs génériques des sites générés : pas de petit libellé au-dessus de chaque titre, pas de police à chasse fixe pour les données, pas de boîtes arrondies avec ombre, pas de boutons en pilule, pas de mot mis en couleur dans les titres.

## Couleurs

| Rôle | Jeton | Clair | Sombre | Usage |
|---|---|---|---|---|
| Fond de page | `--canvas-soft` | `#d8d6ce` | `#161c17` | Papier de toutes les pages |
| Surface | `--canvas` | `#e6e4dd` | `#1f2620` | Bouton secondaire, contrôles de l'en-tête |
| Encre | `--ink` | `#1c231d` | `#e4e2da` | Titres, texte, liens, triangles des sommets |
| Texte secondaire | `--body` | `#46523f` | `#a3aa9e` | Chapeaux, descriptions, informations secondaires |
| Filet | `--hairline` | `#bebcb0` | `#333d34` | Séparateurs, 1 px |
| Action principale | `--primary` | `#3c4a3a` | `#e4e2da` | Bouton plein |
| Bandeau inversé | `--band` | `#3c4a3a` | `#232b24` | Section « Entreprises » uniquement |
| Courbes de niveau | `--contour` | `#84674a` | `#a88c6d` | Courbes de la carte 2D et du relief 3D |
| Balisage | `--summit` | `#a62a21` | `#e0675a` | Sentier de la carte et anneau de focus. Jamais ailleurs |

## Typographie

Une seule famille, **Archivo**, à largeur variable (un fichier, auto-hébergé). La largeur porte la hiérarchie : plus un titre est grand, plus il est resserré, comme sur une carte.

| Classe | Taille | Graisse | Largeur | Usage |
|---|---|---|---|---|
| `display-xl` | 40 à 68 px | 700 | 82 % | Titre de page |
| `display-lg` | 28 à 38 px | 700 | 88 % | Titre de section |
| `display-md` | 20 px | 600 | 94 % | Titre d'entrée, sous-titre |
| `lead` | 18 px | 400 | 100 % | Chapeau, 40 rem de large au plus |
| corps | 16 px | 400 | 100 % | Texte courant |
| `meta` | 14 px | 400 | 90 % | Dates, technologies, légendes ; chiffres alignés |
| `summit-label` | 15 px | 600 | 78 % | Noms des sommets sur la carte |

Les titres sont des phrases, en casse de phrase. Aucun texte en capitales.

## Mise en page

- Conteneur de 1200 px au plus, marges de 24 px. Tout est aligné à gauche.
- Espacements en multiples de 4 px. Sections séparées de 80 à 96 px.
- Une section commence directement par son titre ; la navigation la nomme déjà.
- L'accueil propose deux chemins sous le titre : « Vous recrutez un stagiaire » et « Vous avez un projet ».

## Formes et élévation

- Aucune ombre. Les entrées de liste (`.card`) se détachent par un filet d'encre en tête, pas par une boîte.
- Boutons, contrôles et images : rayon de 5 px.

## Composants

- **`btn-primary`** : bouton plein, 44 px de haut. L'action principale d'un bloc.
- **`btn-secondary`** : bouton sur surface claire.
- **`card`** : entrée de liste (projet, preuve, chemin). Au survol, son titre se souligne.
- **`link`** : lien dans le texte, encre soulignée.
- **`project-map`** : la carte des projets. Carrée sous 640 px, panoramique au-delà. Chaque sommet est un triangle noir, un nom étroit avec un halo couleur papier, son année et son altitude.
- **Relief 3D** : supplément de la carte sur grand écran. Même relief, mêmes courbes, mêmes étiquettes.

## Mouvement

Un seul moment orchestré, à l'arrivée sur l'accueil : le titre monte mot par mot, puis le texte, les chemins et la carte, qui bascule en perspective et trace son sentier. Ensuite rien ne bouge sans action du visiteur (survol d'un sommet, rotation, inclinaison à la souris). Tout est coupé avec `prefers-reduced-motion`.

## À faire

- Garder le rouge pour le sentier et le focus.
- Garder un seul bandeau inversé par page.
- Faire passer tout nouveau texte par `src/content/`, dans les deux langues.

## À éviter

- Ajouter une couleur d'accent, ou mettre un mot d'un titre en couleur.
- Ajouter un libellé au-dessus d'un titre, ou un texte en capitales.
- Réintroduire une police à chasse fixe, des boîtes ombrées ou des pilules.
- Ajouter un second décor (dégradé, illustration, icônes décoratives).
- Afficher un chiffre qui ne vient pas d'une source vérifiable.

## Comportement adaptatif

| Largeur | Changements |
|---|---|
| Moins de 640 px | Carte carrée en 2D, grilles sur une colonne, navigation sur une seconde ligne qui défile (dernier lien estompé) |
| 640 px et plus | Carte panoramique, relief 3D si le navigateur le permet |
| 768 px et plus | Grilles de deux et trois colonnes, navigation sur une ligne |

Le thème suit le réglage du système, puis le choix du visiteur.
