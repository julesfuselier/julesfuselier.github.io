// js/detail-loader.js
console.log("✅ detail-loader.js chargé !");

function loadProjectDetails() {
    console.log("Attempting to load project details...");

    if (!window.allProjects) {
        console.error("ERREUR: allProjects n'est pas chargé. (depuis detail-loader)");
        return;
    }

    const translate = window.translate || ((key) => key.split('.').pop());
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    const project = window.allProjects.find(p => p.id === projectId);

    const loadingEl = document.getElementById('project-loading');
    const contentEl = document.getElementById('project-content');
    const errorEl = document.getElementById('project-error');

    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.classList.add('hidden', 'opacity-0');
    if (errorEl) errorEl.classList.add('hidden');

    if (!project) {
        console.error(`Projet non trouvé pour l'ID: ${projectId}`);
        if (errorEl) errorEl.classList.remove('hidden');
        return;
    }

    console.log(`Projet trouvé: ${project.id}`);

    const title = translate(project.titleKey);
    const longDescription = translate(project.longDescKey) || "Description non disponible.";

    document.title = `${title} – Jules Fuselier`;
    document.getElementById('nav-title').textContent = title;
    document.getElementById('project-title').textContent = title;

    // === MODIFICATION ICI ===
    // On ajoute les attributs à l'élément image
    // 1. loading="lazy"
    // 2. width="683" height="384" (ratio 16:9 pour h-96 / 384px)
    // =======================
    const imgEl = document.getElementById('project-image');
    imgEl.src = project.img;
    imgEl.alt = `Image du projet ${title}`;
    imgEl.loading = 'lazy';
    imgEl.width = 683;
    imgEl.height = 384;

    document.getElementById('project-long-description').innerHTML = longDescription;

    const tagsContainer = document.getElementById('project-tags');
    tagsContainer.innerHTML = '';
    project.tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'bg-accent/10 text-accent px-3 py-1.5 text-xs font-medium rounded-full border border-accent/20';
        tagEl.textContent = tag;
        tagsContainer.appendChild(tagEl);
    });

    const linksContainer = document.getElementById('project-links');
    linksContainer.innerHTML = '';

    const linkTranslations = {
        'Voir sur GitHub': translate('projects.links.github') || 'Voir sur GitHub',
        'Installer (jDeploy)': translate('projects.links.jdeploy') || 'Installer (jDeploy)',
        'Démo Web (lente)': translate('projects.links.demo') || 'Démo Web (lente)',
        'Voir le code': translate('projects.links.code') || 'Voir le code'
    };

    project.links.forEach(link => {
        const linkEl = document.createElement('a');
        linkEl.href = link.url;
        linkEl.target = '_blank';
        const translatedName = linkTranslations[link.name] || link.name;

        if (link.name.toLowerCase().includes('github') || link.name.toLowerCase().includes('code')) {
            linkEl.className = 'bg-muted text-foreground px-5 py-3 rounded-lg hover:bg-border transition font-medium';
        } else {
            linkEl.className = 'bg-accent text-accent-foreground px-5 py-3 rounded-lg hover:bg-accent-hover transition font-medium';
        }

        linkEl.textContent = translatedName;
        linksContainer.appendChild(linkEl);
    });

    if (contentEl) {
        contentEl.classList.remove('hidden');
        setTimeout(() => contentEl.classList.add('opacity-100'), 10);
    }
}

document.addEventListener('DOMContentLoaded', loadProjectDetails);
window.addEventListener('languageChanged', loadProjectDetails);