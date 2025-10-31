// js/projects.js

console.log("✅ projects.js chargé !");

function loadProjects() {
    console.log("🔄 loadProjects() appelée");

    const container = document.querySelector("#projects-container");
    if (!container) {
        console.warn("⚠️ Container #projects-container introuvable");
        return;
    }

    if (!window.allProjects) {
        console.error("❌ ERREUR: 'allProjects' n'est pas chargée.");
        container.innerHTML = '<p style="color: red; text-align: center;">Erreur: Base de données des projets non chargée</p>';
        return;
    }

    console.log("📊 allProjects disponible:", window.allProjects);

    const featuredProjects = window.allProjects.filter(p => p.featured);
    console.log("⭐ Projets featured:", featuredProjects);

    if (featuredProjects.length === 0) {
        console.warn("⚠️ Aucun projet featured trouvé");
        return;
    }

    container.innerHTML = '';

    featuredProjects.forEach((p) => {
        const title = window.translate ? window.translate(p.titleKey) : p.titleKey;
        const description = window.translate ? window.translate(p.descKey) : p.descKey;
        const viewText = window.translate ? window.translate("projects.viewDetails") : "Voir les détails";

        console.log(`🎨 Rendu du projet: ${p.id} - ${title}`);

        // Création de l'élément <a> (carte de projet)
        const cardLink = document.createElement('a');
        cardLink.href = `project-detail.html?id=${p.id}`;
        cardLink.className = 'group bg-card text-card-foreground border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 block';
        // Structure HTML de la carte
        cardLink.innerHTML = `
            <div class="relative overflow-hidden h-56 bg-gradient-to-br from-accent/10 to-accent/5">
                <img 
                    src="${p.img}" 
                    alt="${title}" 
                    class="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    width="398" 
                    height="224"
                >
            </div>
            <div class="p-6 flex flex-col justify-between">
                <div>
                    <h4 class="text-xl font-bold mb-3 group-hover:text-accent transition-colors">${title}</h4>
                    <p class="text-sm text-muted-foreground mb-4 leading-relaxed">${description}</p>
                </div>
                <div class="flex flex-wrap gap-2 mb-4" id="tags-${p.id}">
                </div>
                
                <div class="inline-flex items-center gap-2 text-accent text-sm font-semibold group/link">
                    <span>${viewText}</span>
                    <span class="group-hover/link:translate-x-1 transition-transform">→</span>
                </div>
            </div>
        `;

        // Ajout de la carte au container
        container.appendChild(cardLink);

        // Ajout des tags APRÈS insertion dans le DOM
        const tagsContainer = document.getElementById(`tags-${p.id}`);
        if (tagsContainer) {
            p.tags.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'bg-accent/10 text-accent px-3 py-1.5 text-xs font-medium rounded-full border border-accent/20 hover:bg-accent/20 transition-colors';
                tagSpan.textContent = tag;
                tagsContainer.appendChild(tagSpan);
            });
        }
    });

    console.log("✅ Tous les projets ont été rendus");

    // Animation fade-in
    if (window.observeFadeIns) {
        window.observeFadeIns(container);
    }
}

// Exécution au chargement du DOM
document.addEventListener("DOMContentLoaded", loadProjects);

// Export global
window.loadProjects = loadProjects;

// Recharger quand la langue change
window.addEventListener('languageChanged', loadProjects);