// js/i18n.js - Système de traduction FR/EN

const translations = {
    fr: {
        // Navbar
        "nav.about": "À propos",
        "nav.skills": "Compétences",
        "nav.projects": "Projets",
        "nav.contact": "Contact",
        "nav.back": "← Retour à l'accueil",
        "nav.backToGallery": "← Retour à la galerie",

        // Hero
        "hero.greeting": "Bonjour, je suis Jules Fuselier",
        "hero.subtitle": "Développeur créatif, je conçois des expériences numériques réfléchies, précises et respectueuses de notre planète.",
        "hero.cta": "Voir mes projets",

        // About
        "about.title": "À propos de moi",
        "about.subtitle": "Développeur Web & Logiciel",
        "about.p1": "Salut, moi c’est <strong>Jules 👋</strong><br>Développeur passionné et curieux, j’aime donner vie à des projets qui allient <strong>technique, design et sens</strong>.",
        "about.p2": "Que ce soit en <strong>développement web</strong>, <strong>logiciel</strong> ou dans des expérimentations autour de <strong>l’IA</strong>, je cherche toujours à créer des solutions performantes, claires et utiles.",
        "about.p3": "Ce qui me motive avant tout, c’est d’<strong>apprendre en continu</strong>, de relever de nouveaux défis et de concevoir des expériences qui ont un vrai impact — à la fois pour les utilisateurs et pour <strong>l’avenir du numérique 🌿</strong>.",

        // Timeline
        "timeline.title": "Mon Parcours",
        "timeline.subtitle": "Études, projets et étapes clés",

        "timeline.2024.title": "Début du BUT Informatique – IUT d’Aix-en-Provence",
        "timeline.2024.desc": "Découverte des bases du développement web, de la programmation orientée objet (Java, C++) et des projets en équipe.",

        "timeline.2025.title": "Projets avancés et spécialisation web",
        "timeline.2025.desc": "Création d’applications web dynamiques en PHP/MySQL, découverte du MVC et des bonnes pratiques Git & CI/CD.",

        "timeline.2025b.title": "Développement du portfolio & projets personnels",
        "timeline.2025b.desc": "Conception d’un portfolio professionnel, apprentissage de l’intelligence artificielle et de Flutter.",

        "timeline.2026.title": "Stage – Avril",
        "timeline.2026.desc": "Réalisation d’un stage en développement pour valider ma 2ᵉ année de BUT Informatique.",

        "timeline.future.title": "École d’ingénieur & projets IA",
        "timeline.future.desc": "Intégrer une école d'ingénieur et approfondir mes compétences en intelligence artificielle et conception logicielle.",


        // Skills
        "skills.title": "Mes compétences",
        "skills.subtitle": "Les technologies que j’utilise au quotidien",
        "skills.frontend.title": "Frontend",
        "skills.backend.title": "Backend",
        "skills.learning.title" : "En cours d'apprentissage",
        "skills.devops.title" : "DevOps et outils serveurs",
        "skills.tools.title" : "Outils et logiciels",

        // Projects
        "projects.title": "Mes Projets",
        "projects.more": "Voir plus de projets →",
        "projects.viewDetails": "Voir les détails",
        "projects.view": "Voir le projet",

        // --- Clés pour la page Galerie ---
        "projects.gallery.navTitle": "Galerie des Projets",
        "projects.gallery.title": "Tous mes projets",

        // --- Clés pour la page Détail ---
        "projects.loadingTitle": "Détail du Projet",
        "projects.loading": "Chargement du projet...",
        "projects.about": "À propos de ce projet",
        "projects.tech": "Technologies utilisées",
        "projects.links.github": "Voir sur GitHub",
        "projects.links.jdeploy": "Installer (jDeploy)",
        "projects.links.demo": "Démo Web (lente)",
        "projects.links.code": "Voir le code",

        // --- Descriptions des Projets ---
        "projects.ri.title": "Plateforme Relations Internationales",
        "projects.ri.desc": "Application web MVC en PHP/MySQL développée pour le service des relations internationales de l’IUT d’Aix-en-Provence.",
        "projects.ri.longDesc": `
            <p>Application web développée pour numériser la gestion des dossiers de mobilité internationale de l’IUT d’Aix-en-Provence. L'application, bâtie sur une <strong>architecture MVC en PHP vanille</strong>, gère l'intégralité du processus.</p>
            <ul class="list-disc list-inside space-y-2 mt-4">
              <li><strong>Fonctionnalités clés :</strong> Authentification multi-rôles (étudiant, admin, enseignant) avec intégration du <strong>CAS AMU</strong>, gestion des candidatures par destination, et un back-office complet pour le service des RI.</li>
              <li><strong>Gestion des données :</strong> Conception d'un schéma relationnel <strong>MySQL</strong> robuste pour lier étudiants, destinations, universités partenaires et pièces justificatives (upload sécurisé).</li>
              <li><strong>DevOps :</strong> Mise en place d'un workflow <strong>GitHub Actions</strong> pour le déploiement continu (CI/CD) et les tests automatisés, assurant la fiabilité et la maintenance continue sur le serveur de l'IUT.</li>
            </ul>
        `,
        "projects.bomberman.title": "SuperBomberman – Remake JavaFX",
        "projects.bomberman.desc": "Remake complet du jeu Bomberman en JavaFX avec IA, collisions, power-ups et architecture orientée objet propre.",
        "projects.bomberman.longDesc": `
            <p>Remake complet du jeu Bomberman en Java, en se concentrant sur une architecture logicielle robuste et les bonnes pratiques de l'orienté objet pour un projet en équipe.</p>
            <ul class="list-disc list-inside space-y-2 mt-4">
              <li><strong>Architecture Logicielle :</strong> Application des <strong>principes SOLID</strong> et utilisation de <strong>Design Patterns</strong> clés (Factory, Controller) pour garantir la maintenabilité.</li>
              <li><strong>Défis techniques :</strong> Implémentation d'une IA ennemie basique, gestion précise des collisions et propagation en chaîne des explosions.</li>
            </ul>
        `,

        // Contact
        "contact.title": "Créons ensemble",
        "contact.text": "Que vous ayez un projet en tête, envie de collaborer, discuter d'une idée ou simplement de discuter de technologies — je serais enchanté d’échanger avec vous.",
        "contact.cta": "M’envoyer un email",
        "contact.cv": "Télécharger mon CV",
        "contact.socials": "Retrouvez moi aussi sur :",

        // Footer
        "footer.text": "Construit avec ❤️ et ☘️ pour un web meilleur",

        // Erreurs
        "errors.404.title": "Erreur 404",
        "errors.404.project": "Désolé, ce projet n'a pas été trouvé."
    },
    en: {
        // Navbar
        "nav.about": "About",
        "nav.skills": "Skills",
        "nav.projects": "Projects",
        "nav.contact": "Contact",
        "nav.back": "← Back to Home",
        "nav.backToGallery": "← Back to Gallery",

        // Hero
        "hero.greeting": "Hello, I'm Jules Fuselier",
        "hero.subtitle": "A creative developer crafting thoughtful digital experiences with precision and care for our planet.",
        "hero.cta": "See my projects",

        // About
        "about.title": "About Me",
        "about.subtitle": "Web & Software Developer",
        "about.p1": "Hey, I’m <strong>Jules 👋</strong><br>A passionate and curious developer who loves bringing ideas to life through <strong>clean, meaningful and creative</strong> projects.",
        "about.p2": "Whether it’s <strong>web development</strong>, <strong>software engineering</strong>, or <strong>AI experiments</strong>, I always strive to create solutions that are efficient, clear, and useful.",
        "about.p3": "What drives me most is <strong>continuous learning</strong>, taking on new challenges, and creating experiences that make a real impact — both for users and for <strong>the future of technology 🌿</strong>.",

        // Timeline
        "timeline.title": "My Journey",
        "timeline.subtitle": "Studies, projects, and key milestones",

        "timeline.2024.title": "Start of my Computer Science Bachelor's – Aix-en-Provence IUT",
        "timeline.2024.desc": "Discovered the fundamentals of web development, object-oriented programming (Java, C++), and teamwork.",

        "timeline.2025.title": "Advanced projects and web specialization",
        "timeline.2025.desc": "Built dynamic PHP/MySQL web applications, explored MVC architecture, and learned Git & CI/CD best practices.",

        "timeline.2025b.title": "Portfolio development & personal projects",
        "timeline.2025b.desc": "Designed a professional portfolio, started learning AI and Flutter.",

        "timeline.2026.title": "Internship – April",
        "timeline.2026.desc": "Completed a development internship to validate my 2nd year of the Computer Science Bachelor's degree.",

        "timeline.future.title": "Engineering school & AI projects",
        "timeline.future.desc": "Join an engineering school to deepen my skills in artificial intelligence and software engineering.",

        // Skills
        "skills.title": "My Skills",
        "skills.subtitle": "Technologies I work with daily",
        "skills.frontend.title": "Frontend",
        "skills.backend.title": "Backend",
        "skills.learning.title" : "Currently Learning",
        "skills.devops.title" : "DevOps & Server Tools",
        "skills.tools.title" : "Tools & Software",

        // Projects
        "projects.title": "My Projects",
        "projects.more": "See more projects →",
        "projects.view": "View project",
        "projects.viewDetails" : "View Details",

        // --- Clés pour la page Galerie ---
        "projects.gallery.navTitle": "Project Gallery",
        "projects.gallery.title": "All my projects",

        // --- Clés pour la page Détail ---
        "projects.loadingTitle": "Project Details",
        "projects.loading": "Loading project...",
        "projects.about": "About this project",
        "projects.tech": "Technologies used",
        "projects.links.github": "View on GitHub",
        "projects.links.jdeploy": "Install (jDeploy)",
        "projects.links.demo": "Web Demo (slow)",
        "projects.links.code": "View Code",

        // --- Descriptions des Projets ---
        "projects.ri.title": "International Relations Platform",
        "projects.ri.desc": "MVC web application in PHP/MySQL developed for the international relations department of IUT Aix-en-Provence.",
        "projects.ri.longDesc": `
            <p>Web application developed to digitize the management of international mobility files at the IUT of Aix-en-Provence. The application, built on a <strong>vanilla PHP MVC architecture</strong>, manages the entire process.</p>
            <ul class="list-disc list-inside space-y-2 mt-4">
              <li><strong>Key Features:</strong> Multi-role authentication (student, admin, teacher) with <strong>CAS AMU integration</strong>, management of applications by destination, and a complete back-office for the IR department.</li>
              <li><strong>Data Management:</strong> Design of a robust <strong>MySQL</strong> relational schema to link students, destinations, partner universities, and supporting documents (secure upload).</li>
              <li><strong>DevOps:</strong> Implementation of a <strong>GitHub Actions</strong> workflow for continuous deployment (CI/CD) and automated testing, ensuring reliability and continuous maintenance on the IUT server.</li>
            </ul>
        `,
        "projects.bomberman.title": "SuperBomberman – JavaFX Remake",
        "projects.bomberman.desc": "Complete remake of Bomberman game in JavaFX with AI, collision detection, power-ups, and clean object-oriented architecture.",
        "projects.bomberman.longDesc": `
            <p>Complete remake of the Bomberman game in Java, focusing on robust software architecture and object-oriented best practices for a team project.</p>
            <ul class="list-disc list-inside space-y-2 mt-4">
              <li><strong>Software Architecture:</strong> Application of <strong>SOLID principles</strong> and use of key <strong>Design Patterns</strong> (Factory, Controller) to ensure maintainability.</li>
              <li><strong>Technical Challenges:</strong> Implementation of a basic enemy AI, precise collision management, and chain propagation of explosions.</li>
            </ul>
        `,

        // Contact
        "contact.title": "Let's Create Together",
        "contact.text": "Whether you have a project in mind, want to collaborate, discuss about an idea or just chat about tech – I'd love to hear from you.",
        "contact.cta": "Send me an email",
        "contact.cv": "Download my CV",
        "contact.socials": "Also find me on:",


        // Footer
        "footer.text": "Built with ❤️ and ☘️ for a better web",

        // Erreurs
        "errors.404.title": "Error 404",
        "errors.404.project": "Sorry, this project was not found."
    }
};

// Langue par défaut (détection navigateur ou localStorage)
let currentLang = localStorage.getItem('lang') ||
    (navigator.language.startsWith('fr') ? 'fr' : 'en');

// Fonction pour traduire un élément
function translate(key) {
    return translations[currentLang][key] || key;
}

// Fonction pour mettre à jour tous les textes
function updatePageLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerHTML = translate(key);
    });

    // Sauvegarde dans localStorage
    localStorage.setItem('lang', currentLang);

    // Met à jour le bouton de langue
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.textContent = currentLang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR';
    }


    window.dispatchEvent(new Event('languageChanged'));
}

// Toggle de langue
function toggleLanguage() {
    currentLang = currentLang === 'fr' ? 'en' : 'fr';
    updatePageLanguage();

}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    updatePageLanguage();

    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.addEventListener('click', toggleLanguage);
    }
});

// Export pour utilisation dans d'autres fichiers
window.translate = translate;
window.currentLang = () => currentLang;