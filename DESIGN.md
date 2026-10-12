# DESIGN.md

Système visuel de julesfuselier.fr, direction « Matériel » (octobre 2026). Ce fichier sert de référence à toute personne, ou tout agent, qui modifie l'interface. Les valeurs vivent dans `src/styles/main.css` ; ce document explique les rôles et les règles.

## Vue d'ensemble

Un portfolio de développeur pour deux publics : des recruteurs et des clients. L'univers est celui de l'équipement de montagne : fond ardoise, titres condensés, données en chasse fixe, un orange de balisage. Le site se lit comme une carte de randonnée : un randonneur au camp de base (l'en-tête), un sentier, et un sommet par projet.

Deux décors, pas plus :

1. **Le randonneur 3D** dans l'en-tête : un personnage stylisé qui marche sur un petit socle de montagne. C'est la seule animation en boucle du site.
2. **La carte des projets** : le relief topographique où chaque sommet est un projet. Sa hauteur dit jusqu'où le projet est allé.

## Couleurs

Le thème sombre est la référence de la direction ; le thème clair en est la transposition, avec les mêmes rôles.

| Rôle | Jeton | Sombre | Clair | Usage |
|---|---|---|---|---|
| Fond de page | `--canvas-soft` | `#1b2023` | `#ecebe6` | Fond de toutes les pages |
| Surface | `--canvas` | `#232a2e` | `#f6f5f1` | Cartes, encadrés, bouton secondaire au survol |
| Encre | `--ink` | `#eef0ec` | `#1b2023` | Titres, texte, liens |
| Texte secondaire | `--body` | `#a9b2b5` | `#4e5a5f` | Chapeaux, descriptions, chasse fixe |
| Filet | `--hairline` | `#343c40` | `#c9ccc6` | Bordures et séparateurs, 1 px |
| Action principale | `--primary` | `#eef0ec` | `#1b2023` | Bouton plein. Une seule action principale par écran |
| Balisage | `--summit` | `#f07a3e` | `#a8461a` | Sommets, sentier, drapeaux, survol des grands boutons, anneau de focus |

Contrastes vérifiés : texte secondaire 7,6:1 en sombre et 6:1 en clair, balisage 5,9:1 en sombre et 4,9:1 en clair.

Le balisage orange est la seule couleur d'accent. Il marque ce qui appartient au sentier : sommets, drapeaux, tracé, focus. Jamais en aplat de section.

## Typographie

Trois familles, toutes auto-hébergées (aucune requête vers un service tiers) :

- **Barlow Condensed** pour les titres. Graisse 700 pour les phrases, 800 pour les noms courts.
- **Hanken Grotesk** pour le texte courant. Graisses 400 à 600.
- **IBM Plex Mono** pour la couche technique : repères de section, technologies, périodes, étapes des projets.

| Classe | Police | Taille | Usage |
|---|---|---|---|
| `display-xl` | Barlow Condensed 700 | 44 à 80 px | Titre de page |
| `display-lg` | Barlow Condensed 700 | 36 à 52 px | Titre de section |
| `display-md` | Barlow Condensed 700 | 24 à 28 px | Titre de bloc |
| `name` | Barlow Condensed 800, capitales | 20 à 36 px | Nom court : projet, bouton d'en-tête |
| `lead` | Hanken Grotesk 400 | 18 px | Chapeau, 38 rem de large au plus |
| corps | Hanken Grotesk 400 | 16 px | Texte courant |
| `mono` | IBM Plex Mono 400 | 13 px | Données courtes, chiffres alignés |

Règles :

- Les titres sont des phrases, en casse de phrase, terminées par un point.
- Les capitales sont réservées aux noms courts (un à trois mots) : noms de projets, intitulés des deux grands boutons. Jamais pour une phrase.

## Mise en page

- Conteneur de 1240 px au plus, marges de 24 px (32 px au-delà de 768 px).
- Espacements en multiples de 4 px. Sections séparées de 80 à 96 px, séparées par un filet.
- Tout est aligné à gauche.
- Une section commence par un repère en chasse fixe, un titre et un chapeau facultatif.

## Formes

- Angles droits partout : boutons, encadrés, portrait. Le site est un instrument, pas une application.
- Bouton : un bloc de texte et une case flèche séparés par un filet vertical.
- Pas d'ombre portée. Une surface se détache par un filet de 1 px.

## Composants

- **`btn-primary`** : bloc plein, 52 px de haut, libellé en chasse fixe et case flèche. L'action principale de l'écran.
- **`btn-secondary`** : même forme, en filet.
- **`cta`** (en-tête uniquement) : grand bouton par public, nom court en capitales et une ligne d'explication. Au survol, le balisage remplit le bouton de gauche à droite et la flèche glisse.
- **`project-row`** : ligne de la liste des projets. Nom, type, une phrase, et l'étape atteinte avec son repère.
- **`project-map`** : la carte des projets. Carrée sous 640 px, panoramique au-delà. Chaque sommet est un lien étiqueté.
- **`hiker`** : le randonneur 3D de l'en-tête (voir plus bas).

## La carte des projets

Chaque projet est un sommet, placé de gauche à droite du plus ancien au plus récent, et un sentier en pointillé les relie dans cet ordre.

**La hauteur d'un sommet dit jusqu'où le projet est allé**, pas le temps passé dessus :

| Étape | Clé (`stage` dans `site.json`) | Hauteur relative | Repère |
|---|---|---|---|
| Exploration | `exploration` | 0,35 | cercle |
| Prototype | `prototype` | 0,55 | triangle en filet |
| Livré | `delivered` | 0,78 | triangle plein |
| En service | `in-service` | 1 | triangle plein et drapeau |

« En service » veut dire utilisé par de vraies personnes. C'est un critère vérifiable, que chaque fiche de projet justifie.

Relief 3D : sur un écran d'au moins 640 px, si le navigateur gère WebGL 2, la carte passe en perspective. Une animation à l'arrivée (la vue bascule et le sentier se trace), puis plus rien ne bouge sans action du visiteur.

## Le randonneur

Un personnage stylisé (veste orange, bonnet, sac à dos, bâton) qui marche sur un socle de montagne en facettes, avec trois sommets enneigés et un drapeau au sommet du plus haut. La scène de référence est modelée dans Spline ; `src/js/hiker.js` la reconstruit en Three.js à partir des mêmes formes et des mêmes cotes.

- C'est la seule animation en boucle du site : un pas complet toutes les 1,1 s, un léger rebond, le drapeau qui flotte.
- Il ne s'anime que quand il est visible à l'écran et que l'onglet est actif.
- Avec `prefers-reduced-motion`, il reste immobile dans sa pose de marche.
- Sans WebGL, en économie de données ou en cas d'erreur, une image fixe le remplace.
- Le fond de la scène est transparent. En thème clair, les rochers et la neige prennent des teintes plus soutenues pour rester lisibles sur le fond clair.
- Il est décoratif (`aria-hidden`) : il ne porte aucune information.

## À faire

- Garder le balisage orange pour le sentier, les sommets, les drapeaux et le focus.
- Écrire les titres comme des phrases ; garder les capitales pour les noms courts.
- Donner à chaque projet une étape vérifiable (`stage`) et la justifier dans sa fiche.
- Faire passer tout nouveau texte par `src/content/`, dans les deux langues.

## À éviter

- Ajouter une couleur d'accent, un dégradé ou un troisième décor.
- Ajouter une autre animation en boucle, ou animer au défilement.
- Mettre une phrase en capitales.
- Arrondir les angles.
- Afficher un chiffre qui ne vient pas d'une source vérifiable.

## Comportement adaptatif

| Largeur | Changements |
|---|---|
| Moins de 640 px | Randonneur sous le titre, carte carrée en 2D, grilles sur une colonne, navigation sur une seconde ligne qui défile |
| 640 px et plus | Carte panoramique, relief 3D si le navigateur le permet |
| 900 px et plus | Randonneur à droite du titre |

Le thème suit le réglage du système, puis le choix du visiteur.
