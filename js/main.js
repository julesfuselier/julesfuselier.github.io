// js/main.js

document.addEventListener('DOMContentLoaded', () => {

    // --- Logique du Menu Burger ---
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = mobileMenu.querySelectorAll('a');

    if (menuToggle && mobileMenu) {
        // Ouvre/ferme le menu au clic sur le burger
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Ferme le menu quand on clique sur un lien (pour la navigation sur la même page)
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // --- Logique pour synchroniser les boutons (langue/thème) ---
    // (Le thème est géré dans theme.js, on gère la langue ici)
    const langToggle = document.getElementById('lang-toggle');
    const langToggleMobile = document.getElementById('lang-toggle-mobile');

    if (langToggle && langToggleMobile) {
        // Si `i18n.js` gère le clic, on s'assure juste que les deux boutons font la même chose.
        // On simule un clic sur l'autre bouton pour les garder synchronisés.

        const langHandler = () => {
            // On suppose que la fonction i18n.js a déjà fait son travail.
            // On met à jour le texte de l'autre bouton.
            // Note: Cela suppose que ton `i18n.js` met à jour le texte du bouton sur lequel on clique.

            // Si on clique sur le desktop
            if (document.activeElement === langToggle) {
                langToggleMobile.innerHTML = langToggle.innerHTML;
            }
            // Si on clique sur le mobile
            else if (document.activeElement === langToggleMobile) {
                langToggle.innerHTML = langToggleMobile.innerHTML;
            }
        };

        // Tu devras peut-être adapter ça en fonction de comment `i18n.js` fonctionne.
        // Si `i18n.js` écoute un 'id' spécifique, on doit dupliquer l'écouteur.
        // Pour l'instant, on ajoute juste notre propre synchro.

        // Ceci est une solution simple. L'idéal serait que ton i18n.js gère une 'classe'
        // ou les deux ID.
        // On va juste ajouter le même event listener que tu as sûrement dans i18n.js

        // Si ton i18n.js s'occupe de 'lang-toggle', on ajoute pour 'lang-toggle-mobile'
        if (window.toggleLanguage) { // Si la fonction existe globalement
            langToggleMobile.addEventListener('click', window.toggleLanguage);
        }

        // Et on synchronise le texte
        document.addEventListener('languageChanged', (e) => {
            const newText = e.detail.lang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR';
            langToggle.innerHTML = newText;
            langToggleMobile.innerHTML = newText;
        });

    }

});