// js/skills.js

/**
 * Définit les données des compétences, structurées par catégories.
 * On supprime les "level" pour un look plus pro et moins "scolaire".
 */
function getSkillsData() {
    return [
        {
            categoryKey: "skills.frontend.title",
            icon: "🎨",
            skills: [
                { name: "HTML / CSS" },
                { name: "JavaScript" },
                { name: "Responsive Design" }
            ]
        },
        {
            categoryKey: "skills.backend.title",
            icon: "⚙️",
            skills: [
                { name: "PHP" },
                { name: "Java" },
                { name: "SQL" },
                { name: "Python" },
                { name: "C++" }
            ]
        },
        {
            categoryKey: "skills.devops.title",
            icon: "🛠️",
            skills: [
                { name: "Git / GitHub" },
                { name: "GitHub Actions (CI/CD)" },
                { name: "Linux / Bash" },
                { name: "Serveur web (AlwaysData / Apache)" }
            ]
        },
        {
            categoryKey: "skills.tools.title",
            icon: "🧠",
            skills: [
                { name: "IDE (VS Code, IntelliJ)" },
                { name: "Notion / Trello" },
                { name: "Figma" },
                { name: "🇬🇧 Anglais (C1)" } // Plus pro que "EN: 70%"
            ]
        },
        {
            categoryKey: "skills.learning.title",
            icon: "🚀",
            skills: [
                { name: "Tailwind CSS" },
                { name: "Flutter / Dart" },
                { name: "React" },
                { name: "Node.js / Express" },
                { name: "AI (Python)" }
            ]
        }
    ];
}



/**
 * Charge les catégories de compétences et leurs "tags" dans le DOM.
 */
function loadSkills() {
    const container = document.getElementById("skills-container");
    if (!container) return;

    // S'assurer que le traducteur est prêt
    const translate = window.translate || ((key) => key.split('.').pop()); // Fallback

    container.innerHTML = ''; // Vide le conteneur
    const categories = getSkillsData();

    categories.forEach((category, index) => {
        // Traduit le titre de la catégorie
        const categoryTitle = translate(category.categoryKey);

        // Crée le HTML pour les tags de compétence
        const skillsHTML = `
            <div class="flex flex-wrap gap-3">
                ${category.skills.map(skill => `
                    <span class="skill-tag">
                        ${skill.name}
                    </span>
                `).join("")}
            </div>
        `;

        // Crée le HTML pour la catégorie (colonne)
        // On ajoute un délai d'animation basé sur l'index
        const categoryHTML = `
            <div class="category-block" style="animation-delay: ${index * 0.1}s">
                <h4 class="text-xl font-semibold mb-5 flex items-center gap-2">
                    <span class="text-2xl">${category.icon}</span>
                    ${categoryTitle}
                </h4>
                ${skillsHTML}
            </div>
        `;

        container.innerHTML += categoryHTML;
    });

}

window.loadSkills = loadSkills;
window.addEventListener("languageChanged", loadSkills);