console.log("🔵 Script menu.js chargé !");
// ========================================
// CHARGEMENT DU SCRIPT DE FILTRAGE
// ========================================
(function() {
    const scriptFiltre = document.createElement('script');
    scriptFiltre.src = '/js/menu/filtre.js';
    scriptFiltre.onload = function() {
        console.log('✅ filtre.js chargé avec succès');
    };
    scriptFiltre.onerror = function() {
        console.error('❌ Erreur de chargement de filtre.js');
    };
    document.head.appendChild(scriptFiltre);
})();

//Affichage des Menus 
async function afficherMenus() {
    console.log("🟢 afficherMenus() appelée !");
    console.log("🔍 apiUrl:", apiUrl); 
    console.log("📡 URL complète:", apiUrl + "menus");
    
    try {
        const response = await fetch(apiUrl + "menus", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("📡 Statut réponse:", response.status);

        if (response.ok) {
            const data = await response.json();
            console.log("✅ Data COMPLÈTE reçue:", data);
            
            const menus = data.member || [];
            
            console.log("✅ Menus récupérés:", menus);
            window.menusData = menus;
            console.log("🔥 window.menusData défini:", window.menusData.length, "menus");

            afficherCartes(menus);
        } else {
            console.error("❌ Erreur lors de la récupération des menus");
        }
    } catch (error) {
        console.error("❌ Erreur:", error);
    }
}

//Affichage Photo
function afficherCartes(menus) {
    console.log("🎨 Affichage des cartes, nombre de menus:", menus.length);
    const container = document.getElementById("menus-container");
    
    if (!container) {
        console.error("❌ Élément #menus-container introuvable !");
        return;
    }
    
    container.innerHTML = "";

    if (menus.length === 0) {
        container.innerHTML = "<p class='text-center'>Aucun menu disponible pour le moment.</p>";
        return;
    }

    let cartesHTML = '';
    
    menus.forEach(menu => {
        console.log("📦 Menu:", menu); 
        
        // Extraire l'ID du menu
        const menuId = menu['@id'] ? menu['@id'].split('/').pop() : null;
        console.log("🆔 ID Menu extrait:", menuId);
        
        console.log("📦 Plats:", menu.plats); 
        
        let photo = '/images/default-menu.jpg';
        let platId = null;
        
        if (menu.plats && menu.plats.length > 0) {
            const premierPlat = menu.plats[0];
            console.log("📦 Premier plat:", premierPlat);
            
            // Extraire l'ID du plat
            platId = premierPlat['@id'] ? premierPlat['@id'].split('/').pop() : null;
            console.log("🆔 ID Plat extrait:", platId);
            
            if (premierPlat.photo) {
                if (premierPlat.photo.startsWith('/uploads')) {
                    photo = 'http://127.0.0.1:8000' + premierPlat.photo;
                } else if (premierPlat.photo.startsWith('http')) {
                    photo = premierPlat.photo;
                } else {
                    photo = 'http://127.0.0.1:8000/uploads/photos/' + premierPlat.photo;
                }
            }
        }
        
        console.log("📸 Photo URL finale:", photo);

        const carte = `
    <div class="col-12 col-md-4 text-center mb-3 mb-md-0 p-3">
        <div class="image-card text-white">
            <img src="${photo}" alt="${menu.titre}" class="rounded w-100">
            <a href="/descriptionmenu?id=${menuId}" class="titre-image">${menu.titre}</a>   
            <div class="action-image-buttons" data-show="admin">
                <button type="button" class="btn btn-outline-light btn-edit-menu" 
                        data-menu-id="${menuId}" 
                        data-plat-id="${platId || ''}"
                        data-menu-titre="${menu.titre}">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button type="button" class="btn btn-outline-light btn-delete-menu" 
                        data-menu-id="${menuId}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>         
        </div>
    </div>
`;
        
        cartesHTML += carte;
    });
    
    container.innerHTML = cartesHTML;
    
    console.log("✅ Cartes affichées avec succès");

    attacherEvenementsModale();
}

// ========================================
// GESTION DES MODALES (ÉDITION & SUPPRESSION)
// ========================================

let menuEnCoursSuppression = null;
let menuEnCoursEdition = null;
let platEnCoursEdition = null;

function attacherEvenementsModale() {
    console.log("🔗 Attachement des événements");
    
    // Vérifier le rôle
    const role = localStorage.getItem('role');
    console.log("👤 Rôle détecté:", role);
    
    if(role !== 'admin' && role !== 'employe') {
        console.log('⚠️ Boutons édition/suppression masqués pour le rôle:', role);
        // Masquer tous les boutons d'édition et suppression
        document.querySelectorAll('.btn-edit-menu, .btn-delete-menu').forEach(btn => {
            btn.style.display = 'none';
        });
        return;
    }

    // --- LOGIQUE ÉDITION ---
    const btnsEdit = document.querySelectorAll('.btn-edit-menu');
    btnsEdit.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            menuEnCoursEdition = this.getAttribute('data-menu-id');
            platEnCoursEdition = this.getAttribute('data-plat-id');
            const menuTitre = this.getAttribute('data-menu-titre');

            console.log('🖊️ Édition - Menu ID:', menuEnCoursEdition, '- Plat ID:', platEnCoursEdition);

            document.getElementById('TitreInput').value = menuTitre;
            document.getElementById('PhotoInput').value = '';
            
            const modal = new bootstrap.Modal(document.getElementById('EditionPhotoModal'));
            modal.show();

            // Attacher l'événement au bouton Enregistrer
            setTimeout(() => {
                const btnEnregistrer = document.querySelector('#EditionPhotoModal .btn-glam');
                if (btnEnregistrer) {
                    const nouveauBtn = btnEnregistrer.cloneNode(true);
                    btnEnregistrer.parentNode.replaceChild(nouveauBtn, btnEnregistrer);
                    nouveauBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        await sauvegarderMenu();
                    });
                    console.log('✅ Événement attaché au bouton Enregistrer');
                }
            }, 300);
        });
    });

    // --- LOGIQUE SUPPRESSION ---
    const btnsDelete = document.querySelectorAll('.btn-delete-menu');
    btnsDelete.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            menuEnCoursSuppression = this.getAttribute('data-menu-id');
            
            console.log('🗑️ Suppression - Menu ID:', menuEnCoursSuppression);
            
            const modal = new bootstrap.Modal(document.getElementById('ConfirmationSuppressionModal'));
            modal.show();

            // Attacher l'événement au bouton Confirmer
            setTimeout(() => {
                const btnConfirmer = document.querySelector('#ConfirmationSuppressionModal .btn-confirm-delete');
                if (btnConfirmer) {
                    const nouveauBtn = btnConfirmer.cloneNode(true);
                    btnConfirmer.parentNode.replaceChild(nouveauBtn, btnConfirmer);
                    nouveauBtn.addEventListener('click', async () => {
                        await supprimerMenu();
                    });
                    console.log('✅ Événement attaché au bouton Confirmer suppression');
                }
            }, 300);
        });
    });
}

// ========================================
// FONCTION SAUVEGARDER (ÉDITION)
// ========================================
async function sauvegarderMenu() {
    console.log('💾 🚀 DÉBUT DE LA SAUVEGARDE');
    
    const titre = document.getElementById('TitreInput').value;
    const photoInput = document.getElementById('PhotoInput');
    const token = localStorage.getItem('apiToken');

    console.log('📝 Titre saisi:', titre);
    console.log('📷 Fichier sélectionné:', photoInput.files.length > 0 ? photoInput.files[0].name : 'Aucun');

    if (!titre.trim()) {
        alert('Le titre est obligatoire');
        return;
    }

    if (!token) {
        alert('Vous devez être connecté');
        window.location.href = '/signin';
        return;
    }

    try {
        // ========================================
        // 1️⃣ MODIFIER LE TITRE DU MENU (PATCH)
        // ========================================
        console.log('📝 Mise à jour du titre du menu...');
        
        const responseMenu = await fetch(apiUrl + `menus/${menuEnCoursEdition}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/merge-patch+json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                titre: titre
            })
        });

        console.log('📡 Réponse PATCH Menu:', responseMenu.status);

        if (!responseMenu.ok) {
            throw new Error('Erreur lors de la modification du titre');
        }

        console.log('✅ Titre du menu modifié');

        // ========================================
        // 2️⃣ MODIFIER LA PHOTO DU PLAT (PATCH)
        // ========================================
        if (photoInput.files.length > 0 && platEnCoursEdition) {
            console.log('📷 Upload de la nouvelle photo...');
            
            // Étape A : Upload du fichier
            const formDataUpload = new FormData();
            formDataUpload.append('photo', photoInput.files[0]);
            
            const responseUpload = await fetch('http://127.0.0.1:8000/api/upload/photo', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataUpload
            });

            console.log('📡 Réponse Upload:', responseUpload.status);

            if (!responseUpload.ok) {
                throw new Error("Erreur pendant l'upload");
            }

            const uploadResult = await responseUpload.json();
            console.log('✅ Photo uploadée:', uploadResult.path);

            // Étape B : Mise à jour du chemin de la photo dans le Plat
            console.log('📝 Mise à jour du plat avec la nouvelle photo...');
            
            const responsePlat = await fetch(apiUrl + `plats/${platEnCoursEdition}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/merge-patch+json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    photo: uploadResult.path
                })
            });

            console.log('📡 Réponse PATCH Plat:', responsePlat.status);

            if (!responsePlat.ok) {
                throw new Error('Erreur lors de la mise à jour du plat');
            }

            console.log('✅ Photo du plat modifiée');
        }

        // ========================================
        // 3️⃣ FINALISATION
        // ========================================
        console.log('✅ Toutes les modifications enregistrées avec succès');
        
        // Fermer la modale
        const modalElement = document.getElementById('EditionPhotoModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
        
        // Rafraîchir l'affichage
        await afficherMenus();
        
        // Réinitialiser le formulaire
        document.getElementById('TitreInput').value = '';
        document.getElementById('PhotoInput').value = '';
        
        alert('Modifications enregistrées !');

    } catch (error) {
        console.error('❌ Erreur:', error);
        alert('Erreur : ' + error.message);
    }
}

// ========================================
// FONCTION SUPPRIMER
// ========================================
async function supprimerMenu() {
    console.log('🗑️ 🚀 DÉBUT DE LA SUPPRESSION');
    console.log('🗑️ Menu ID à supprimer:', menuEnCoursSuppression);
    
    const token = localStorage.getItem('apiToken');
    
    if (!token) {
        alert('Vous devez être connecté');
        window.location.href = '/signin';
        return;
    }

    try {
        const response = await fetch(apiUrl + `menus/${menuEnCoursSuppression}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });

        console.log('📡 Réponse DELETE:', response.status);

        if (response.ok || response.status === 204) {
            console.log('✅ Menu supprimé avec succès');
            
            // Fermer la modale
            const modalElement = document.getElementById('ConfirmationSuppressionModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();

            // Rafraîchir l'affichage
            await afficherMenus();
            
            alert('Menu supprimé avec succès !');
        } else {
            throw new Error('Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
        alert("Erreur lors de la suppression : " + error.message);
    }
}


// ========================================
// INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM chargé, initialisation...');
    
    // Corriger l'avertissement aria-hidden de Bootstrap
    const modalElement = document.getElementById('EditionPhotoModal');
    if (modalElement) {
        modalElement.addEventListener('hidden.bs.modal', function () {
            document.body.focus();
        });
        console.log('✅ Correction aria-hidden appliquée');
    }
});

console.log("🚀 Lancement de afficherMenus()...");
afficherMenus();
