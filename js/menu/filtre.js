// ========================================
// FONCTION DE SÉCURITÉ CONTRE XSS
// ========================================
function escapeHtml(text) {
    if (!text) return 'Non renseigné';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// FONCTION DE FILTRAGE
// ========================================
function filtrerMenus() {
    console.log("🎯 Fonction filtrerMenus() appelée !");
    
    // 🔥 Utiliser les menus chargés depuis la BD
    const menus = window.menusData || [];
    
    if (menus.length === 0) {
        console.warn("⚠️ Aucun menu chargé depuis la base de données");
        afficherMenus([]);
        return;
    }
    
    console.log("📊 Nombre total de menus:", menus.length);
    
    // Récupérer les valeurs des filtres
    const regimeSelect = document.getElementById('regime');
    const themeSelect = document.getElementById('theme');
    const nbPersMin = document.getElementById('NombPersMax')?.value;
    const budgetMax = document.getElementById('budgetMax')?.value;
    const prixMin = document.getElementById('priceMin')?.value;
    const prixMax = document.getElementById('priceMax')?.value;

    if (!regimeSelect || !themeSelect) {
        console.error("❌ Les éléments de formulaire ne sont pas trouvés !");
        return;
    }

    // Obtenir les valeurs sélectionnées
    const regimeFiltre = regimeSelect.value;
    const themeFiltre = themeSelect.value;

    console.log("📋 Filtres appliqués:", {
        regime: regimeFiltre,
        theme: themeFiltre,
        nbPersMin,
        budgetMax,
        prixMin,
        prixMax
    });

    // Filtrer les menus
    const menusFiltres = menus.filter(menu => {
        // Fonction helper pour extraire l'ID
        const extraireId = (valeur) => {
            if (!valeur) return null;
            
            // Si c'est un IRI string
            if (typeof valeur === 'string' && valeur.includes('/')) {
                return parseInt(valeur.split('/').pop());
            }
            // Si c'est un objet avec id
            if (typeof valeur === 'object' && valeur.id) {
                return parseInt(valeur.id);
            }
            // Si c'est déjà un nombre
            if (typeof valeur === 'number') {
                return valeur;
            }
            // Si c'est une string qui est un nombre
            if (typeof valeur === 'string' && !isNaN(valeur)) {
                return parseInt(valeur);
            }
            
            return null;
        };
        
        // Extraire les IDs
        const menuRegimeId = extraireId(menu.regime);
        const menuThemeId = extraireId(menu.theme);
        
        console.log("🔍 Analyse menu:", menu.titre || menu.nom, {
            regime_brut: menu.regime,
            regime_id: menuRegimeId,
            theme_brut: menu.theme,
            theme_id: menuThemeId,
            nb_pers: menu.nombre_personne_mini,
            prix: menu.prix_par_personne
        });
        
        // Filtre régime (par ID)
        if (regimeFiltre !== "Tous" && regimeFiltre !== "") {
            const regimeId = parseInt(regimeFiltre);
            if (menuRegimeId !== regimeId) {
                console.log(`  ❌ Rejeté par régime (attendu: ${regimeId}, reçu: ${menuRegimeId})`);
                return false;
            }
        }

        // Filtre thème (par ID)
        if (themeFiltre !== "Tous" && themeFiltre !== "") {
            const themeId = parseInt(themeFiltre);
            if (menuThemeId !== themeId) {
                console.log(`  ❌ Rejeté par thème (attendu: ${themeId}, reçu: ${menuThemeId})`);
                return false;
            }
        }

        // Filtre nombre de personnes minimum
        if (nbPersMin && menu.nombre_personne_mini > parseInt(nbPersMin)) {
            console.log("  ❌ Rejeté par nb personnes");
            return false;
        }

        // Filtre budget maximum (prix par personne)
        if (budgetMax && menu.prix_par_personne > parseFloat(budgetMax)) {
            console.log("  ❌ Rejeté par budget max");
            return false;
        }

        // Filtre prix minimum
        if (prixMin && menu.prix_par_personne < parseFloat(prixMin)) {
            console.log("  ❌ Rejeté par prix min");
            return false;
        }

        // Filtre prix maximum
        if (prixMax && menu.prix_par_personne > parseFloat(prixMax)) {
            console.log("  ❌ Rejeté par prix max");
            return false;
        }

        console.log("  ✅ Menu accepté");
        return true;
    });

    console.log("✅ Menus filtrés:", menusFiltres.length, "résultat(s)");

    // Afficher les résultats
    afficherMenus(menusFiltres);
}

// ========================================
// FONCTION D'AFFICHAGE
// ========================================
function afficherMenus(menusFiltres) {
    console.log("🖼️ Affichage de", menusFiltres.length, "menus");
    
    // Utiliser le conteneur existant de menu.js
    const container = document.getElementById('menus-container');
    
    if (!container) {
        console.error("❌ #menus-container non trouvé !");
        return;
    }

    // Vider le conteneur
    container.innerHTML = '';

    // Message si aucun résultat
    if (menusFiltres.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center">Aucun menu ne correspond à vos critères.</p></div>';
        return;
    }

    // Afficher les menus avec le même format que menu.js
    menusFiltres.forEach(menu => {
        // Extraire l'ID du menu
        const menuId = menu['@id'] ? menu['@id'].split('/').pop() : null;
        
        let photo = '/images/default-menu.jpg';
        let platId = null;
        
        // Récupérer la photo du premier plat
        if (menu.plats && menu.plats.length > 0) {
            const premierPlat = menu.plats[0];
            
            platId = premierPlat['@id'] ? premierPlat['@id'].split('/').pop() : null;
            
            if (premierPlat.photo) {
                if (premierPlat.photo.startsWith('/uploads')) {
                    photo = apiUrl.replace('/api/', '') + premierPlat.photo;
                } else if (premierPlat.photo.startsWith('http')) {
                    photo = premierPlat.photo;
                } else {
                    photo = apiUrl.replace('/api/', '') + '/uploads/photos/' + premierPlat.photo;
                }
            }
        }
        
        // 🔒 SÉCURITÉ XSS : Créer la carte de façon sécurisée
        const col = document.createElement('div');
        col.className = 'col-12 col-md-4 text-center mb-3 mb-md-0 p-3';
        
        const imageCard = document.createElement('div');
        imageCard.className = 'image-card text-white';
        
        // Image
        const img = document.createElement('img');
        img.src = photo;
        img.alt = escapeHtml(menu.titre);
        img.className = 'rounded w-100';
        
        // Lien titre
        const lien = document.createElement('a');
        lien.href = `/descriptionmenu?id=${menuId}`;
        lien.className = 'titre-image';
        lien.textContent = menu.titre;
        
        // Boutons d'action
        const actionButtons = document.createElement('div');
        actionButtons.className = 'action-image-buttons';
        actionButtons.setAttribute('data-show', 'admin');
        
        // Bouton éditer
        const btnEdit = document.createElement('button');
        btnEdit.type = 'button';
        btnEdit.className = 'btn btn-outline-light btn-edit-menu';
        btnEdit.setAttribute('data-menu-id', menuId);
        btnEdit.setAttribute('data-plat-id', platId || '');
        btnEdit.setAttribute('data-menu-titre', menu.titre);
        btnEdit.innerHTML = '<i class="bi bi-pencil-square"></i>';
        
        // Bouton supprimer
        const btnDelete = document.createElement('button');
        btnDelete.type = 'button';
        btnDelete.className = 'btn btn-outline-light btn-delete-menu';
        btnDelete.setAttribute('data-menu-id', menuId);
        btnDelete.innerHTML = '<i class="bi bi-trash"></i>';
        
        // Assembler les éléments
        actionButtons.appendChild(btnEdit);
        actionButtons.appendChild(btnDelete);
        
        imageCard.appendChild(img);
        imageCard.appendChild(lien);
        imageCard.appendChild(actionButtons);
        
        col.appendChild(imageCard);
        container.appendChild(col);
    });

    console.log("✅ Affichage terminé");
}

// ========================================
// INITIALISATION
// ========================================
function initialiserFiltres() {
    console.log('🎬 Initialisation des filtres');
    
    const btnFiltre = document.getElementById('btnFiltre');
    
    if (!btnFiltre) {
        console.error('❌ Bouton #btnFiltre non trouvé !');
        return;
    }
    
    if (btnFiltre.dataset.initialized) {
        console.log('⚠️ Filtres déjà initialisés');
        return;
    }
    
    btnFiltre.dataset.initialized = 'true';
    
    btnFiltre.addEventListener('click', function(e) {
        console.log('🖱️ Clic sur filtrer');
        e.preventDefault();
        filtrerMenus();
    });
    
    console.log('✅ Filtres initialisés');
}

// Attendre que le DOM soit chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiserFiltres);
} else {
    initialiserFiltres();
}

// Timeout de secours
setTimeout(() => {
    const btn = document.getElementById('btnFiltre');
    if (btn && !btn.dataset.initialized) {
        console.log("⏰ Initialisation via timeout");
        initialiserFiltres();
    }
}, 1000);

// Export pour debug
window.filtrerMenus = filtrerMenus;