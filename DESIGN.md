# DESIGN.md

Système visuel de julesfuselier.fr. Ce fichier sert de référence à toute personne, ou tout agent, qui modifie l'interface. Les valeurs vivent dans `src/styles/main.css` ; ce document explique les rôles et les règles.

## Vue d'ensemble

Un portfolio de développeur pour deux publics : des recruteurs et des clients. Le système est sobre : une surface de pierre claire, une encre vert forêt, des titres serrés et un seul décor, la carte topographique des projets. La méthode vient du système de Vercel (peu de couleurs, une action principale, un décor unique), appliquée à une palette inspirée des Dolomites.

## Couleurs

| Rôle | Jeton | Clair | Sombre | Usage |
|---|---|---|---|---|
| Fond de page | `--canvas-soft` | `#d8d6ce` | `#161c17` | Fond de toutes les pages |
| Surface | `--canvas` | `#e6e4dd` | `#1f2620` | Cartes, bouton secondaire, pastille |
| Encre | `--ink` | `#1c231d` | `#e4e2da` | Titres, texte, liens |
| Texte secondaire | `--body` | `#46523f` | `#a3aa9e` | Chapeaux, descriptions, chasse fixe |
| Filet | `--hairline` | `#bebcb0` | `#333d34` | Bordures et séparateurs, 1 px |
| Action principale | `--primary` | `#3c4a3a` | `#e4e2da` | Bouton plein. Une seule action principale par écran |
| Bandeau inversé | `--band` | `#3c4a3a` | `#232b24` | Section « Entreprises » uniquement |
| Sommet | `--summit` | `#b75b39` | `#cf6f4c` | Repères de la carte et anneau de focus. Jamais ailleurs |

## Typographie

- **Space Grotesk** pour tout le texte. Graisses 400, 500 et 600. Jamais 700.
- **JetBrains Mono** pour la couche technique : repères de section, technologies, périodes. Jamais pour un paragraphe.

| Classe | Taille | Graisse | Interlettrage | Usage |
|---|---|---|---|---|
| `display-xl` | 40 à 64 px | 600 | -0,045 em | Titre de page |
| `display-lg` | 28 à 36 px | 600 | -0,04 em | Titre de section |
| `display-md` | 20 px | 600 | -0,03 em | Titre de carte, sous-titre |
| `lead` | 18 px | 400 | 0 | Chapeau, 40 rem de large au plus |
| corps | 16 px | 400 | 0 | Texte courant |
| `mono` | 13 px | 400 | 0 | Données courtes, chiffres alignés |

Les titres sont des phrases, en casse de phrase, terminées par un point.

## Mise en page

- Conteneur de 1200 px au plus, marges de 24 px.
- Espacements en multiples de 4 px. Sections séparées de 80 à 96 px ; l'intérieur d'une carte reste serré (8 à 12 px entre titre et texte).
- Tout est aligné à gauche.
- Chaque section commence par un repère en chasse fixe (son nom dans la navigation), un titre et un chapeau facultatif.

## Élévation

Pas d'ombre portée lourde. Une carte se détache par sa surface plus claire, un filet intérieur et une ombre empilée très légère (`.card`).

## Formes

- Boutons, pastilles, liens de navigation : pilule (rayon complet).
- Cartes et portrait : rayon de 8 px.

## Composants

- **`btn-primary`** : pilule pleine, 48 px de haut. L'action principale de l'écran.
- **`btn-secondary`** : pilule sur surface claire avec filet.
- **`card`** : bloc de contenu cliquable ou non. Les deux projets professionnels occupent une rangée de deux, les autres une rangée de trois.
- **`link`** : lien dans le texte, encre soulignée.
- **`project-map`** : la carte des projets. Carrée sous 640 px, panoramique au-delà. Chaque sommet est un lien étiqueté.
- **Relief 3D** : supplément de la carte sur grand écran. Même relief, mêmes courbes, mêmes étiquettes. Une seule animation, à l'arrivée : la vue bascule de la verticale à la perspective. Ensuite rien ne bouge sans action du visiteur.

## À faire

- Garder la terre cuite pour les sommets et le focus.
- Garder un seul bandeau inversé par page.
- Écrire les titres comme des phrases.
- Faire passer tout nouveau texte par `src/content/`, dans les deux langues.

## À éviter

- Ajouter une couleur d'accent.
- Mettre un titre ou un libellé en capitales.
- Ajouter un second décor (dégradé, illustration, icônes décoratives).
- Animer au défilement ou en boucle.
- Afficher un chiffre qui ne vient pas d'une source vérifiable.

## Comportement adaptatif

| Largeur | Changements |
|---|---|
| Moins de 640 px | Carte carrée en 2D, grilles sur une colonne, navigation sur une seconde ligne qui défile |
| 640 px et plus | Carte panoramique, relief 3D si le navigateur le permet |
| 768 px et plus | Grilles de deux et trois colonnes, navigation sur une ligne |

Le thème suit le réglage du système, puis le choix du visiteur. Les animations respectent `prefers-reduced-motion` : le relief s'affiche alors directement en perspective.
