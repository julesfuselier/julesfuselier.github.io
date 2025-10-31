// js/transition.js (Optimisé)
document.addEventListener("DOMContentLoaded", () => {
    // --- Barre de chargement à l'arrivée (inchangée) ---
    // Elle ne bloque pas la navigation, donc elle est "gratuite" en termes de performance perçue.
    const bar = document.createElement("div");
    bar.id = "loading-bar";
    document.body.appendChild(bar);

    requestAnimationFrame(() => {
        bar.style.width = "60%";
    });

    window.addEventListener("load", () => {
        bar.style.width = "100%";
        setTimeout(() => bar.classList.add("fade-out"), 400); // Délai OK ici
        setTimeout(() => bar.remove(), 800);                   // Délai OK ici
    });

    // --- Transition de sortie (partie optimisée) ---
    const links = document.querySelectorAll("a[href]");
    links.forEach((link) => {
        const href = link.getAttribute("href");

        // Ignore les ancres internes (#about, #contact…)
        if (!href || href.startsWith("#")) return;

        // Ignore les liens externes ou les téléchargements
        const url = new URL(link.href);
        const isExternal = url.origin !== window.location.origin;
        const isDownload = link.hasAttribute("download");

        if (isExternal || isDownload) return;

        // Écouteur de clic optimisé
        link.addEventListener("click", (e) => {
            // S'il y a un clic molette/droit (nouvel onglet), ne rien faire
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.which > 1) return;

            e.preventDefault(); // Empêche la navigation immédiate

            // 1. Déclenche l'animation de sortie
            document.body.classList.add("fade-out");

            // 2. Déclenche la barre de chargement de sortie
            const barOut = document.createElement("div");
            barOut.id = "loading-bar-exit";
            document.body.appendChild(barOut);
            requestAnimationFrame(() => (barOut.style.width = "100%"));

            // 3. Navigue vers la nouvelle page en parallèle
            // On utilise un tout petit délai pour laisser le temps au navigateur
            // de "peindre" le début de l'animation (le fade-out).
            // 50ms est imperceptible pour l'utilisateur, contre 400ms avant.
            setTimeout(() => {
                window.location.href = link.href;
            }, 50); // Juste assez de temps pour que le fade-out commence
        });
    });
});