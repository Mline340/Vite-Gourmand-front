function escapeHtml(text) {
  if (!text) return 'Non renseigné';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ========================================
// VARIABLES GLOBALES
// ========================================
let menuSelectionne = null;
let utilisateurConnecte = null;

async function initialiser() {
    alert("Le script de commande démarre !"); // Si cette alerte ne s'affiche pas, le problème est le chargement du fichier JS
    console.log('🚀 Initialisation de la page de commande');
    // ... reste du code
}
// ========================================
// INITIALISATION
// ========================================
async function initialiser() {
    console.log('🚀 Initialisation de la page de commande');
    
    // Vérifier que l'utilisateur est connecté
    if (!verifierConnexion()) {
        return;
    }
    
    // Récupérer l'ID du menu depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const menuId = urlParams.get('id');
    
    console.log('📋 Menu ID depuis URL:', menuId);
    
    if (!menuId) {
        afficherErreur('Aucun menu sélectionné. Vous allez être redirigé vers la page des menus.');
        setTimeout(() => {
            window.location.href = '/menu';
        }, 3000);
        return;
    }
    
    // Afficher le loader
    afficherLoader(true);
    
    try {
        // Charger les données en parallèle
        await Promise.all([
            chargerMenuPourCommande(menuId),
            chargerDonneesUtilisateur()
        ]);
        
        calculerFraisLivraison();
        // Initialiser le formulaire
        initialiserFormulaireCommande();
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        afficherErreur('Une erreur est survenue lors du chargement des données.');
    } finally {
        afficherLoader(false);
    }
}

// Événements d'initialisation
document.addEventListener('DOMContentLoaded', initialiser);

// Gérer le retour avec le bouton "précédent" (bfcache)
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        console.log('🔄 Page restaurée depuis le cache, rechargement...');
        initialiser();
    }
});

// ========================================
// VÉRIFICATION DE CONNEXION
// ========================================
function verifierConnexion() {
    console.log('🔐 Vérification de la connexion...');
    
    // Essayer de récupérer les données utilisateur depuis sessionStorage
    const userJson = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');
    
    console.log('📦 SessionStorage user:', userJson ? '✅ Présent' : '❌ Absent');
    console.log('📦 SessionStorage token:', token ? '✅ Présent' : '❌ Absent');
    
    if (!userJson) {
        console.error('❌ Aucune donnée utilisateur trouvée');
        afficherErreur('Vous devez être connecté pour commander.');
        setTimeout(() => {
            window.location.href = '/connexion';
        }, 2000);
        return false;
    }
    
    try {
        utilisateurConnecte = JSON.parse(userJson);
        console.log('✅ Utilisateur connecté:', utilisateurConnecte);
        
        // Vérifier que l'objet contient au moins un ID ou email
        if (!utilisateurConnecte.id && !utilisateurConnecte.email) {
            console.error('❌ Données utilisateur invalides');
            throw new Error('Données utilisateur invalides');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la lecture des données utilisateur:', error);
        sessionStorage.removeItem('user');
        afficherErreur('Session invalide. Veuillez vous reconnecter.');
        setTimeout(() => {
            window.location.href = '/connexion';
        }, 2000);
        return false;
    }
}

// ========================================
// CHARGEMENT DES DONNÉES DU MENU
// ========================================
async function chargerMenuPourCommande(menuId) {
    console.log('📡 Chargement du menu ID:', menuId);
    
    try {
        const response = await fetch(apiUrl + `menus/${encodeURIComponent(menuId)}`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        menuSelectionne = await response.json();
        console.log('✅ Menu chargé:', menuSelectionne);
        
        // Afficher les informations du menu
        afficherInformationsMenu();
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement du menu:', error);
        throw new Error('Impossible de charger les informations du menu.');
    }
}

// ========================================
// CHARGEMENT DES DONNÉES UTILISATEUR
// ========================================
async function chargerDonneesUtilisateur() {
    console.log('📡 Récupération du profil complet...');
    
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("apiToken");

    if (!userId || !token) return;

    try {
        const response = await fetch(apiUrl + `users/${encodeURIComponent(userId)}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const profilComplet = await response.json();
            console.log('✅ Profil complet récupéré:', profilComplet);

            // On met à jour notre variable globale avec TOUTES les infos
            utilisateurConnecte = {
                id: profilComplet.id,
                email: profilComplet.email,
                nom: profilComplet.nom,   // Attention aux noms de champs API (lastname ?)
                prenom: profilComplet.prenom, // Attention (firstname ?)
                tel: profilComplet.tel,
                adresse: profilComplet.adresse,
                codeP: profilComplet.codeP,
                ville: profilComplet.ville
            };

            // On met à jour le sessionStorage pour les prochaines fois
            sessionStorage.setItem('user', JSON.stringify(utilisateurConnecte));
            
            // Maintenant on peut afficher
            afficherDonneesUtilisateur();
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement du profil:', error);
    }
    
    afficherDonneesUtilisateur();
    
}

// ========================================
// AFFICHAGE DES INFORMATIONS DU MENU
// ========================================
function afficherInformationsMenu() {
    if (!menuSelectionne) {
        console.error('❌ Aucun menu sélectionné');
        return;
    }
    
    console.log('📊 Affichage des informations du menu:', menuSelectionne);
    
    // Titre du menu
    const titreElement = document.getElementById('menu-titre');
    console.log('🔍 Élément menu-titre:', titreElement);
    if (titreElement) {
        titreElement.textContent = menuSelectionne.titre || 'Menu sans titre';
        console.log('✅ Titre affiché:', menuSelectionne.titre);
    } else {
        console.error('❌ Élément #menu-titre non trouvé dans le DOM');
    }
    
    // Prix par personne
    const prixElement = document.getElementById('menu-prix');
    console.log('🔍 Élément menu-prix:', prixElement);
    if (prixElement) {
        prixElement.textContent = `${menuSelectionne.prix_par_personne || 0} €`;
        console.log('✅ Prix affiché:', menuSelectionne.prix_par_personne);
    } else {
        console.error('❌ Élément #menu-prix non trouvé dans le DOM');
    }
    
    // Nombre de personnes minimum
    const nbPersonnesElement = document.getElementById('menu-nb-personnes');
    console.log('🔍 Élément menu-nb-personnes:', nbPersonnesElement);
    if (nbPersonnesElement) {
        nbPersonnesElement.textContent = `${menuSelectionne.nombre_personne_mini || 1} personne(s)`;
        console.log('✅ Nb personnes affiché:', menuSelectionne.nombre_personne_mini);
    } else {
        console.error('❌ Élément #menu-nb-personnes non trouvé dans le DOM');
    }
    
    // Quantité restante (NOUVEAU)
    const quantiteElement = document.getElementById('menu-quantite');
    if (quantiteElement) {
        const quantite = menuSelectionne.quantite_restante || 0;
        quantiteElement.textContent = `${quantite} disponible(s)`;
        
        // Afficher un badge selon la quantité
        if (quantite === 0) {
            quantiteElement.classList.add('badge', 'bg-danger');
        } else if (quantite < 10) {
            quantiteElement.classList.add('badge', 'bg-warning');
        } else {
            quantiteElement.classList.add('badge', 'bg-success');
        }
        
        console.log('✅ Quantité affichée:', quantite);
    }
    
    // Mettre à jour le nombre minimum dans l'input
    const nbPersonnesInput = document.getElementById('nombre_personne');
    console.log('🔍 Élément nombre_personne input:', nbPersonnesInput);
    if (nbPersonnesInput) {
        nbPersonnesInput.min = menuSelectionne.nombre_personne_mini || 1;
        nbPersonnesInput.value = menuSelectionne.nombre_personne_mini || 1;
        console.log('✅ Input nombre de personnes configuré');
        nbPersonnesInput.addEventListener('input', calculerPrixTotal);
    
        // Recalculer le prix total
        calculerPrixTotal();
    } else {
        console.error('❌ Élément #nombre_personne non trouvé dans le DOM');
    }
    
    console.log('✅ Toutes les informations du menu ont été traitées');

    
}

// ========================================
// AFFICHAGE DES DONNÉES UTILISATEUR
// ========================================
function afficherDonneesUtilisateur() {
    console.log('👤 Affichage des données utilisateur...');
    
    if (!utilisateurConnecte) {
        console.error('❌ utilisateurConnecte est null');
        return;
    }
    
    console.log('👤 Utilisateur connecté:', utilisateurConnecte);
    
    // Nom Prénom
    const nomPrenom = `${utilisateurConnecte.nom|| ''} ${utilisateurConnecte.prenom || ''}`.trim() || 'Non renseigné';
    const nomPrenomElement = document.getElementById('user-nom-prenom');
    if (nomPrenomElement) {
        nomPrenomElement.textContent = nomPrenom;
        console.log('✅ Nom Prénom affiché:', nomPrenom);
    } else {
        console.error('❌ Élément #user-nom-prenom non trouvé');
    }
    
    // Email
    const email = utilisateurConnecte.email || 'Non renseigné';
    const emailElement = document.getElementById('user-email');
    if (emailElement) {
        emailElement.textContent = email;
        console.log('✅ Email affiché:', email);
    } else {
        console.error('❌ Élément #user-email non trouvé');
    }
    
    // Téléphone
    const tel =  utilisateurConnecte.tel || 'Non renseigné';
    const telElement = document.getElementById('user-tel');
    if (telElement) {
        telElement.textContent = tel;
        console.log('✅ Tel affiché:', tel);
    } else {
        console.error('❌ Élément #user-tel non trouvé');
    }
    
    // Rue (adresse)
    const rue = utilisateurConnecte.adresse || 'Non renseignée';
    const rueElement = document.getElementById('user-rue');
    if (rueElement) {
        rueElement.textContent = rue;
        console.log('✅ Rue affichée:', rue);
    } else {
        console.error('❌ Élément #user-rue non trouvé');
    }
    
    // Ville (code postal + ville)
    const codePostal = utilisateurConnecte.codeP || '';
    const ville = utilisateurConnecte.ville || '';
    const villeComplete = [codePostal, ville].filter(Boolean).join(' ') || 'Non renseignée';
    
    const villeElement = document.getElementById('user-ville');
    if (villeElement) {
        villeElement.textContent = villeComplete;
        console.log('✅ Ville affichée:', villeComplete);
    } else {
        console.error('❌ Élément #user-ville non trouvé');
    }
    
    console.log('✅ Toutes les données utilisateur ont été affichées');
    calculerFraisLivraison();
}
// ========================================
// CACUL PRIX TRANSPORT
//=========================================
    let fraisLivraisonCalculés = 0;

    function calculerFraisLivraison() {
    // 1. Récupérer la ville (on nettoie les espaces et on met en minuscule pour comparer)
    const villeBrute = (utilisateurConnecte.ville || "").trim().toLowerCase();
    console.log('🔍 Analyse de la ville pour le tarif:', villeBrute);
    
    //paramètre livraison
    const tarifBase = 5.00;
    const tarifKm = 0.59;
    let message = "";

    if (villeBrute === "bordeaux") {  
    fraisLivraisonCalculés = tarifBase;
    message = "Livraison à Bordeaux : Forfait 5€";
    console.log('✅ Ville reconnue : Bordeaux (Forfait 5€)');
    } else {
        const distanceKm = 10; 
        fraisLivraisonCalculés = tarifBase + (distanceKm * tarifKm);
         message = `Livraison hors Bordeaux : 5€ + ${distanceKm}km × 0.59€`;
    }

    document.getElementById('prix-livraison-display').textContent = fraisLivraisonCalculés.toFixed(2);
    
    const infoElement = document.getElementById('livraison-info');
    if (infoElement) {
        infoElement.textContent = message;
    }
    
    calculerPrixTotal();
    }



// ========================================
// CALCUL DU PRIX TOTAL
// ========================================
function calculerPrixTotal() {
    if (!menuSelectionne) return;
    
    const nbPersonnesInput = document.getElementById('nombre_personne');
    const prixTotalElement = document.getElementById('prix-total');
    
    if (!nbPersonnesInput || !prixTotalElement) return;
    
    const nombrePersonnes = parseInt(nbPersonnesInput.value) || menuSelectionne.nombre_personne_mini || 1;
    const prixParPersonne = menuSelectionne.prix_par_personne || 0;
    const prixMenu = nombrePersonnes * prixParPersonne;

    // Calcul de la remise 
    let remise = 0;
    const personnesAuDessusMini = nombrePersonnes - (menuSelectionne.nombre_personne_mini || 0);
    if (personnesAuDessusMini >= 5) {
        remise = prixMenu * 0.10;
    }

    // Afficher/masquer le conteneur de remise
    const remiseContainer = document.getElementById('remise-container');
    const montantRemise = document.getElementById('montant-remise');
    if (remise > 0) {
        remiseContainer.classList.remove('d-none');
        remiseContainer.classList.remove('text-muted');
        remiseContainer.classList.add('text-success');
        montantRemise.textContent = remise.toFixed(2);
    } else {
        remiseContainer.classList.remove('d-none');
        remiseContainer.classList.remove('text-success');
        remiseContainer.classList.add('text-muted');
        montantRemise.textContent = '0.00';
    }

    const prixTotalFinal = (prixMenu - remise) + fraisLivraisonCalculés;
    prixTotalElement.textContent = `${prixTotalFinal.toFixed(2)} €`;
    console.log(`💵 Prix total final: ${prixTotalFinal}€`);
}

// ========================================
// INITIALISATION DU FORMULAIRE
// ========================================
function initialiserFormulaireCommande() {
    console.log('⚙️ Initialisation du formulaire de commande');

    // Vérifier la quantité disponible
    if (menuSelectionne && menuSelectionne.quantite_restante <= 0) {
        afficherErreur('Ce menu n\'est plus disponible.');
        const btnSubmit = document.querySelector('#form-commande button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="bi bi-x-circle me-2"></i>Menu indisponible';
        }
        return;
    }
    
    // Événement sur le changement du nombre de personnes
    const nbPersonnesInput = document.getElementById('nombre_personne');
    if (nbPersonnesInput) {
        nbPersonnesInput.addEventListener('input', function() {
            const min = parseInt(this.min) || 1;
            const max = menuSelectionne?.quantite_restante || 999;
            const valeur = parseInt(this.value) || min;
            
            if (valeur < min) {
                this.value = min;
                afficherAvertissement(`Le nombre minimum de personnes pour ce menu est ${min}.`);
            }
            if (valeur > max) {
            this.value = max;
            afficherAvertissement(`Seulement ${max} portion(s) disponible(s) pour ce menu.`);
        }
            calculerPrixTotal();
        });
    }
    
    // Événement sur la soumission du formulaire
    const formulaire = document.getElementById('form-commande');
    if (formulaire) {
        formulaire.addEventListener('submit', async function(e) {
            e.preventDefault();
            await soumettreCommande();
        });
    }
    
    console.log('✅ Formulaire initialisé');
}

// ========================================
// SOUMISSION DE LA COMMANDE
// ========================================
async function soumettreCommande() {
    console.log('📤 Soumission de la commande...');
    
    // Désactiver le bouton de soumission
    const btnSubmit = document.querySelector('#form-commande button[type="submit"]');
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Envoi en cours...';
    }
    
    try {
        // Récupérer les données du formulaire
        const formData = new FormData(document.getElementById('form-commande'));
        const nbPers = parseInt(formData.get('nombre_personne')) || 1;
        
        // ✅ NOUVELLE VALIDATION : Vérifier la quantité disponible
        if (!menuSelectionne || menuSelectionne.quantite_restante === undefined) {
            throw new Error('Informations du menu non disponibles');
        }
        
        if (nbPers > menuSelectionne.quantite_restante) {
            throw new Error(`Désolé, il ne reste que ${menuSelectionne.quantite_restante} portion(s) disponible(s) pour ce menu.`);
        }
        
        // On calcule le prix total (Prix Menu * nb personnes + livraison)
        const prixParPersonne = menuSelectionne.prix_par_personne || 0;
        let prixMenuTotal = nbPers * prixParPersonne;

        // Calculer la remise (même logique que calculerPrixTotal)
        let remise = 0;
        const personnesAuDessusMini = nbPers - (menuSelectionne.nombre_personne_mini || 0);
        if (personnesAuDessusMini >= 5) {
            remise = prixMenuTotal * 0.10;
        }

        prixMenuTotal = prixMenuTotal - remise;
        const totalFinal = parseFloat((prixMenuTotal + fraisLivraisonCalculés).toFixed(2));
        console.log('💰 Prix menu total:', prixMenuTotal);
        console.log('🚚 Frais livraison calculés:', fraisLivraisonCalculés);
        console.log('💵 Total final:', totalFinal);
        console.log('🍽️ Menu sélectionné:', menuSelectionne);
        console.log('🆔 ID du menu:', menuSelectionne?.id);

        if (!menuSelectionne || !menuSelectionne['@id']) {
        throw new Error('Aucun menu sélectionné');
        }

        const commandeData = {
            menus: [menuSelectionne['@id']],
            user: `/api/users/${utilisateurConnecte.id}`,
            nombre_personne: parseInt(formData.get('nombre_personne')),
            date_prestation: formData.get('date_prestation'),
            heure_liv: formData.get('heure_liv') + ':00', 
            pret_mat: formData.get('pret_mat') === 'on',
            prix_menu: parseFloat(prixMenuTotal.toFixed(2)),
            prix_liv: parseFloat(fraisLivraisonCalculés.toFixed(2)) || 0,
            total_commande: parseFloat(totalFinal.toFixed(2))
        };
        
        console.log('📦 Données de la commande:', commandeData);
        
        // Envoyer la commande à l'API
       const token = localStorage.getItem('apiToken'); 
            if (!token) {
            throw new Error('Vous devez être connecté pour passer commande');
        }
        console.log('🔑 Token utilisé:', token ? 'Présent' : 'Absent');

        console.log('💸 Prix livraison envoyé:', commandeData.prix_liv, 'Type:', typeof commandeData.prix_liv);

        const response = await fetch(apiUrl + 'commandes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
         body: JSON.stringify(commandeData)
        });
       
        const responseData = await response.json();
        console.log('📥 Réponse API:', responseData);

        if (!response.ok) {
            console.error('❌ Détails erreur:', responseData);
            console.log('🔍 Violations:', responseData.violations);
            throw new Error(responseData.message || 'Erreur lors de la création de la commande');
        }
                
        console.log('✅ Commande créée:', responseData);
  
        // Message de succès
        alert(`Commande ${responseData.numero_commande} créée avec succès !`);
        // Redirection
        window.location.href = 'account.html?id=' + encodeURIComponent(responseData.id);
        // OU si vous n'avez pas de page confirmation :
        window.location.href = '/menu';
        
    } catch (error) {
        console.error('❌ Erreur lors de la soumission:', error);
        afficherErreur(error.message || 'Une erreur est survenue lors de l\'enregistrement de votre commande.');
        
        // Réactiver le bouton
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = 'Commander';
        }
    }
}

// ========================================
// FONCTIONS UTILITAIRES
// ========================================
function afficherLoader(afficher) {
    const loader = document.getElementById('loading');
    if (loader) {
        loader.style.display = afficher ? 'block' : 'none';
    }
}

function afficherErreur(message) {
    console.error('❌', message);
    
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        ${escapeHtml(message)}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-dismiss après 5 secondes
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function afficherSucces(message) {
    console.log('✅', message);
    
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        <i class="bi bi-check-circle-fill me-2"></i>
        ${escapeHtml(message)}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
}

function afficherAvertissement(message) {
    console.warn('⚠️', message);
    
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-warning alert-dismissible fade show';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        <i class="bi bi-exclamation-circle-fill me-2"></i>
        ${escapeHtml(message)}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Export pour debug
window.chargerMenuPourCommande = chargerMenuPourCommande;
window.calculerPrixTotal = calculerPrixTotal;

// ========================================
// LANCEMENT
// ========================================

// On vérifie si le DOM est déjà prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiser);
} else {
    // Si le DOM est déjà chargé (cas fréquent avec les routeurs JS), on lance direct
    console.log('🚀 DOM déjà prêt, lancement immédiat de initialiser()...');
    initialiser();
}