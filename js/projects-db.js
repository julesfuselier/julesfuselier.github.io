// js/projects-db.js

const allProjects = [
    {
        id: 'relations-internationales',
        featured: true, // Ce projet apparaîtra sur l'accueil

        // CORRIGÉ : J'ai renommé les clés pour correspondre à projects.js
        titleKey: 'projects.ri.title', // (C'était 'title')
        descKey: 'projects.ri.desc', // (C'était 'shortDescription')
        longDescKey: 'projects.ri.longDesc', // Clé pour la page de détail (à ajouter à i18n)

        img: 'assets/img/relations-internationales.webp',
        tags: ['PHP', 'MySQL', 'MVC', 'GitHub Actions', 'CAS'],

        // --- Infos pour la page détail ---
        longDescription: `
      <p>Application web développée pour numériser la gestion des dossiers de mobilité internationale de l’IUT d’Aix-en-Provence. L'application, bâtie sur une <strong>architecture MVC en PHP vanille</strong>, gère l'intégralité du processus.</p>
      <ul class="list-disc list-inside space-y-2 mt-4">
        <li><strong>Fonctionnalités clés :</strong> Authentification multi-rôles (étudiant, admin, enseignant) avec intégration du <strong>CAS AMU</strong>, gestion des candidatures par destination, et un back-office complet pour le service des RI.</li>
        <li><strong>Gestion des données :</strong> Conception d'un schéma relationnel <strong>MySQL</strong> robuste pour lier étudiants, destinations, universités partenaires et pièces justificatives (upload sécurisé).</li>
        <li><strong>DevOps :</strong> Mise en place d'un workflow <strong>GitHub Actions</strong> pour le déploiement continu (CI/CD) et les tests automatisés, assurant la fiabilité et la maintenance continue sur le serveur de l'IUT.</li>
      </ul>
    `,
        links: [
            { name: 'Voir le code sur GitHub', url: 'https://github.com/julesfuselier/SAE-A2_intra-iut-relations-internationales' }
        ]
    },
    {
        id: 'superbomberman-javafx',
        featured: true, // Ce projet apparaîtra aussi sur l'accueil

        // CORRIGÉ : J'ai renommé les clés
        titleKey: 'projects.bomberman.title', // (C'était 'title')
        descKey: 'projects.bomberman.desc', // (C'était 'shortDescription')
        longDescKey: 'projects.bomberman.longDesc', // Clé pour la page de détail (à ajouter à i18n)

        img: 'assets/img/superbomberman.webp',
        tags: ['Java', 'JavaFX', 'OOP', 'Design Patterns'],

        // --- Infos pour la page détail ---
        longDescription: `
      <p>Remake complet du jeu Bomberman en Java, en se concentrant sur une architecture logicielle robuste et les bonnes pratiques de l'orienté objet pour un projet en équipe.</p>
      <ul class="list-disc list-inside space-y-2 mt-4">
        <li><strong>Architecture Logicielle :</strong> Application des <strong>principes SOLID</strong> et utilisation de <strong>Design Patterns</strong> clés (Factory, Controller) pour garantir la maintenabilité.</li>
        <li><strong>Défis techniques :</strong> Implémentation d'une IA ennemie basique, gestion précise des collisions et propagation en chaîne des explosions.</li>
      </ul>
    `,
        links: [
            { name: 'Installer (jDeploy)', url: 'https://www.jdeploy.com/~s201-superbomberman-remake' },
            { name: 'Démo Web (lente)', url: 'demo/demo-SuperBomberman.html' },
            { name: 'Voir le code sur GitHub', url: 'https://github.com/julesfuselier/S201-SuperBomberman-remake' }
        ]
    }
    // --- TODO: AJOUTE AUTRES PROJETS ICI ---
];

window.allProjects = allProjects;

