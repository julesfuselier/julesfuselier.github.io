// js/timeline.js
console.log("✅ timeline.js chargé !");

function loadTimeline() {
    console.log("🔄 loadTimeline() appelée");

    const container = document.querySelector("#timeline-container");
    if (!container) {
        console.warn("⚠️ Container #timeline-container introuvable");
        return;
    }

    if (!window.timelineEvents) {
        console.error("❌ ERREUR: 'timelineEvents' n'est pas chargée.");
        container.innerHTML = '<p style="color: red; text-align: center;">Erreur : Données de la timeline non chargées.</p>';
        return;
    }

    console.log("📊 timelineEvents disponible :", window.timelineEvents);

    container.innerHTML = '';

    window.timelineEvents.forEach((event, index) => {
        const translate = window.translate ? window.translate : (key => key);

        const title = event.titleKey ? translate(event.titleKey) : event.title;
        const description = event.descriptionKey ? translate(event.descriptionKey) : event.description;

        const isRight = event.side === "right";
        const sideClass = isRight
            ? "md:justify-start md:flex-row-reverse md:pl-16"
            : "md:justify-end md:pr-16";

        const wrapper = document.createElement("div");
// LIGNE CORRIGÉE
        wrapper.className = `relative flex flex-col md:flex-row items-center ${sideClass} mb-20 fade-in visible`;        wrapper.style.animationDelay = `${index * 0.1}s`;

        // ✅ Carte visible avec variables CSS
        wrapper.innerHTML = `
            <!-- Point central -->
            <div class="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-accent border-4 border-background shadow-lg z-10"></div>

            <!-- Carte timeline -->
            <div class="timeline-card">
                <div class="flex items-center gap-3 mb-3">
                    <div class="text-2xl">${event.icon}</div>
                    <h4>${title}</h4>
                </div>
                <p>${description}</p>
                <span>${event.year}</span>
            </div>
        `;

        container.appendChild(wrapper);
    });

    console.log("✅ Timeline rendue avec succès");

    if (window.observeFadeIns) {
        window.observeFadeIns(container);
    }
}

// Exécution au chargement
document.addEventListener("DOMContentLoaded", loadTimeline);
window.loadTimeline = loadTimeline;
window.addEventListener("languageChanged", loadTimeline);
