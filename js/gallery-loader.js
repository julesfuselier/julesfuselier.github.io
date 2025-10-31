// js/gallery-loader.js
console.log("✅ gallery-loader.js chargé !");

function loadGallery() {
    const container = document.getElementById('all-projects-gallery');
    if (!container) return;

    if (!window.allProjects) {
        console.error("ERREUR: 'allProjects' n'est pas chargée. (depuis gallery-loader)");
        container.innerHTML = '<p class="text-center text-red-500">Erreur: La base de données des projets n\'a pas pu être chargée.</p>';
        return;
    }

    const translate = window.translate || ((key) => key.split('.').pop());
    container.innerHTML = '';

    allProjects.forEach(project => {
        const title = translate(project.titleKey);
        const description = translate(project.descKey);
        const viewText = translate("projects.viewDetails") || "Voir les détails";

        const cardLink = document.createElement('a');
        cardLink.href = `project-detail.html?id=${project.id}`;
        cardLink.className = 'group bg-card text-card-foreground border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:border-accent/50 block';

        // === MODIFICATION ICI ===
        // Ajout de :
        // 1. loading="lazy" (éco-responsable)
        // 2. width="398" height="224" (qualitatif : évite le layout shift)
        // =======================
        cardLink.innerHTML = `
      <div class="h-56 w-full overflow-hidden relative bg-gradient-to-br from-accent/10 to-accent/5">
        <img 
            src="${project.img}" 
            alt="Image du projet ${title}" 
            class="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            width="398"
            height="224"
        >
      </div>
      <div class="p-6">
        <h3 class="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">${title}</h3>
        <p class="text-muted-foreground text-sm mb-4 h-12">${description}</p>
        <div class="flex flex-wrap gap-2 mb-4">
          ${project.tags.slice(0, 4).map(tag =>
            `<span class="bg-accent/10 text-accent px-3 py-1.5 text-xs font-medium rounded-full border border-accent/20">${tag}</span>`
        ).join('')}
        </div>
        <div class="inline-flex items-center gap-2 text-accent text-sm font-semibold group/link">
            <span>${viewText}</span>
            <span class="group-hover/link:translate-x-1 transition-transform group-hover/link:gap-3 transition-all">→</span>
        </div>
      </div>
    `;

        container.appendChild(cardLink);
    });
}

document.addEventListener('DOMContentLoaded', loadGallery);
window.addEventListener('languageChanged', loadGallery);