console.log("🔵 Script descriptionmenu.js chargé !");

// ========================================
// RÉCUPÉRATION DE L'ID DU MENU DEPUIS L'URL
// ========================================
function getMenuIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const menuId = urlParams.get('id');
    console.log('🆔 Menu ID depuis URL:', menuId);
    return menuId;
}

// ========================================
// RÉCUPÉRATION DES DÉTAILS DU MENU
// ========================================
async function afficherDetailsMenu() {
    const menuId = getMenuIdFromUrl();
    
    if (!menuId) {
        afficherErreur("Aucun menu spécifié dans l'URL");
        return;
    }

    console.log('📡 Récupération du menu ID:', menuId);

    try {
        // Récupérer les détails du menu
        const response = await fetch(apiUrl + `menus/${menuId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('📡 Statut réponse:', response.status);

        if (!response.ok) {
            throw new Error('Menu introuvable');
        }

        const menu = await response.json();
        console.log('✅ Menu récupéré:', menu);

        // Afficher les données
        afficherMenu(menu);

    } catch (error) {
        console.error('❌ Erreur:', error);
        afficherErreur('Impossible de charger les détails du menu');
    }
}

// ========================================
// AFFICHAGE DES DONNÉES DU MENU
// ========================================
async function afficherMenu(menu) {
    console.log('Données du menu:', menu);
    
    // Cacher le loading
    document.getElementById('loading').style.display = 'none';
    
    // Afficher le contenu
    document.getElementById('menu-content').style.display = 'block';

    // Photo du menu (depuis le premier plat)
    let photoUrl = '/images/default-menu.jpg';
    if (menu.plats && menu.plats.length > 0 && menu.plats[0].photo) {
        const photo = menu.plats[0].photo;
        if (photo.startsWith('/uploads')) {
            photoUrl = 'http://127.0.0.1:8000' + photo;
        } else if (photo.startsWith('http')) {
            photoUrl = photo;
        }
    }
    document.getElementById('menu-photo').src = photoUrl;
    document.getElementById('menu-photo').alt = menu.titre;

    // Titre
    document.getElementById('menu-titre').textContent = menu.titre;

    // Description
    const description = menu.description || 'Aucune description disponible';
    document.getElementById('menu-description').textContent = description;

    // Prix
    document.getElementById('menu-prix').textContent = menu.prix_par_personne + ' €';

    // Nombre de personnes minimum
    document.getElementById('menu-personnes').textContent = menu.nombre_personne_mini + ' personnes';

    // Quantité restante
    const quantite = menu.quantite_restante || 0;
    document.getElementById('menu-quantite').textContent = quantite + ' menus disponibles';

    // Régime alimentaire
    const regimeContainer = document.getElementById('regime-container');
    const regimeElement = document.getElementById('menu-regime');
    
    if (menu.regime) {
        try {
            // Si c'est un IRI, on fait un appel API
            if (typeof menu.regime === 'string' && menu.regime.startsWith('/api/')) {
                const response = await fetch('http://127.0.0.1:8000' + menu.regime);
                const regimeData = await response.json();
                regimeContainer.style.display = 'block';
                regimeElement.textContent = regimeData.libelle || regimeData.nom || 'Non spécifié';
            }
            // Si c'est déjà un objet
            else if (typeof menu.regime === 'object') {
                regimeContainer.style.display = 'block';
                regimeElement.textContent = menu.regime.libelle || menu.regime.nom || 'Non spécifié';
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du régime:', error);
            regimeContainer.style.display = 'none';
        }
    } else {
        regimeContainer.style.display = 'none';
    }

    // Thème
    const themeContainer = document.getElementById('theme-container');
    const themeElement = document.getElementById('menu-theme');
    
    if (menu.theme) {
        try {
            // Si c'est un IRI, on fait un appel API
            if (typeof menu.theme === 'string' && menu.theme.startsWith('/api/')) {
                const response = await fetch('http://127.0.0.1:8000' + menu.theme);
                const themeData = await response.json();
                themeContainer.style.display = 'block';
                themeElement.textContent = themeData.libelle || themeData.nom || 'Non spécifié';
            }
            // Si c'est déjà un objet
            else if (typeof menu.theme === 'object') {
                themeContainer.style.display = 'block';
                themeElement.textContent = menu.theme.libelle || menu.theme.nom || 'Non spécifié';
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du thème:', error);
            themeContainer.style.display = 'none';
        }
    } else {
        themeContainer.style.display = 'none';
    }
// Allergènes - À récupérer via les plats
const allergenesContainer = document.getElementById('allergenes-container');
const allergenesElement = document.getElementById('menu-allergenes');

console.log('Plats du menu:', menu.plats); // Debug

if (menu.plats && menu.plats.length > 0) {
    try {
        // Récupérer les détails de tous les plats
        const platsPromises = menu.plats.map(plat => {
            // Extraire l'ID du plat
            let platUrl;
            if (plat['@id']) {
                platUrl = 'http://127.0.0.1:8000' + plat['@id'];
            } else if (plat.id) {
                platUrl = `http://127.0.0.1:8000/api/plats/${plat.id}`;
            } else {
                return null;
            }
            
            console.log('Récupération du plat:', platUrl);
            return fetch(platUrl).then(r => r.json());
        });
        
        const platsDetails = await Promise.all(platsPromises.filter(p => p !== null));
        console.log('Détails des plats récupérés:', platsDetails);
        
        // Collecter tous les allergènes de tous les plats
        let tousLesAllergenes = [];
        
        for (const plat of platsDetails) {
            console.log('Allergènes du plat', plat.titre_plat, ':', plat.allergenes);
            
            if (plat.allergenes && plat.allergenes.length > 0) {
                // Si ce sont des IRIs (comme "/api/allergenes/1")
                if (typeof plat.allergenes[0] === 'string' && plat.allergenes[0].startsWith('/api/')) {
                    const allergenesPromises = plat.allergenes.map(iri => 
                        fetch('http://127.0.0.1:8000' + iri)
                            .then(r => r.json())
                            .catch(err => {
                                console.error('Erreur récupération allergène:', iri, err);
                                return null;
                            })
                    );
                    const allergenesDetails = await Promise.all(allergenesPromises);
                    tousLesAllergenes.push(...allergenesDetails.filter(a => a !== null));
                } 
                // Si ce sont déjà des objets complets
                else if (typeof plat.allergenes[0] === 'object') {
                    tousLesAllergenes.push(...plat.allergenes);
                }
            }
        }
        
        console.log('Tous les allergènes collectés:', tousLesAllergenes);
        
        // Supprimer les doublons (par ID ou libellé)
        const allergenesUniques = tousLesAllergenes.filter((allergene, index, self) =>
            index === self.findIndex(a => 
                (a.id && allergene.id && a.id === allergene.id) || 
                (a.libelle === allergene.libelle)
            )
        );
        
        console.log('Allergènes uniques:', allergenesUniques);
        
        if (allergenesUniques.length > 0) {
            allergenesContainer.style.display = 'block';
            const allergenesHtml = allergenesUniques
                .map(allergene => `<span class="badge bg-warning text-dark me-2">${allergene.libelle || allergene.nom}</span>`)
                .join('');
            allergenesElement.innerHTML = allergenesHtml;
        } else {
            allergenesContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des allergènes:', error);
        allergenesContainer.style.display = 'none';
    }
} else {
    allergenesContainer.style.display = 'none';
}

    // Conditions
    const conditionsContainer = document.getElementById('conditions-container');
    if (menu.conditions) {
        conditionsContainer.style.display = 'block';
        document.getElementById('menu-conditions').textContent = menu.conditions;
    } else {
        conditionsContainer.style.display = 'none';
    }

// Gestion du bouton Commander
const btnCommander = document.getElementById('btn-commander');
const noStockMessage = document.getElementById('no-stock-message');

if (quantite > 0) {
    btnCommander.style.display = 'inline-block';
    noStockMessage.style.display = 'none';
    
    // Retirer les anciens événements pour éviter les doublons
    const nouveauBtn = btnCommander.cloneNode(true);
    btnCommander.parentNode.replaceChild(nouveauBtn, btnCommander);
    
    // Événement click sur le nouveau bouton Commander
    nouveauBtn.addEventListener('click', function() {
        // Récupérer l'ID du menu depuis l'URL actuelle
        const urlParams = new URLSearchParams(window.location.search);
        const menuId = urlParams.get('id');
        
        // Rediriger vers la page de commande avec l'ID du menu
        // Le router.js va gérer la vérification de connexion
        window.location.href = `/commande?id=${menuId}`;
    });
} else {
    btnCommander.style.display = 'none';
    noStockMessage.style.display = 'block';
}
}

// ========================================
// AFFICHAGE DES ERREURS
// ========================================
function afficherErreur(message) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('menu-content').style.display = 'none';
    
    const errorMessage = document.getElementById('error-message');
    document.getElementById('error-text').textContent = message;
    errorMessage.style.display = 'block';
}

// ========================================
// INITIALISATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM chargé, chargement des détails du menu...');
    afficherDetailsMenu();
});

// ⭐ Appel direct au cas où le DOM est déjà chargé
console.log('🚀 Appel direct de afficherDetailsMenu()...');
afficherDetailsMenu();