// js/detail-loader.js (Modifié pour le SEO dynamique)
console.log("✅ detail-loader.js chargé !");

/**
 * Met à jour les balises <meta> et <title> dans le <head> pour le SEO
 * et le partage sur les réseaux sociaux (Open Graph).
 */
function updateMetaTags(title, description, imageUrl, pageUrl) {
    console.log(`Updating meta tags for: ${title}`);

    // 1. Mettre à jour le <title> de la page
    document.title = `${title} – Jules Fuselier`;

    // 2. Mettre à jour le <link canonical>
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', pageUrl);

    // 3. Mettre à jour la meta description (pour Google)
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);

    // 4. Mettre à jour les balises Open Graph (pour les partages)
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', pageUrl);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', imageUrl);
}

/**
 * Charge les détails du projet dans la page.
 */
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
        // On met à jour le titre même pour une erreur
        document.title = "Projet non trouvé – Jules Fuselier";
        return;
    }

    console.log(`Projet trouvé: ${project.id}`);

    // --- MISE À JOUR SEO DYNAMIQUE ---

    // 1. Traduire les textes
    const title = translate(project.titleKey);
    // On utilise la description COURTE (descKey) pour le SEO, c'est plus concis.
    const shortDescription = translate(project.descKey);
    const longDescription = translate(project.longDescKey) || "Description non disponible.";

    // 2. Construire les URL absolues (nécessaire pour Open Graph)
    // new URL() combine l'URL de base du site avec le chemin relatif de l'image.
    const absoluteImageUrl = new URL(project.img, window.location.origin).href;
    const absolutePageUrl = window.location.href; // L'URL actuelle

    // 3. Appeler la fonction de mise à jour SEO
    updateMetaTags(title, shortDescription, absoluteImageUrl, absolutePageUrl);

    // --- FIN DE LA MISE À JOUR SEO ---


    // --- Remplissage du contenu de la page (comme avant) ---
    document.getElementById('nav-title').textContent = title;
    document.getElementById('project-title').textContent = title;

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