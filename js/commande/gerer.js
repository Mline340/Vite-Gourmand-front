console.log("🔵 Page gestion commande (ADMIN/EMPLOYÉ) chargée !");
const commandeId = new URLSearchParams(window.location.search).get('id');

// Vérifier que l'ID existe
if (!commandeId) {
    console.error('❌ Aucun ID de commande fourni');
    alert('Aucune commande spécifiée');
    window.location.href = '/account';
}

function getToken() {
    return localStorage.getItem("apiToken");
}

function getUserRole() {
    return localStorage.getItem("userRole");
}

// Garde-fou : vérifier les permissions
const userRole = getRole();
const normalizedRole = userRole ? userRole.replace('ROLE_', '').toLowerCase() : null;

console.log('🔍 Role brut:', userRole);
console.log('🔍 Role normalisé:', normalizedRole);

if (normalizedRole !== 'employe' && normalizedRole !== 'admin') {
    console.error('❌ Accès non autorisé');
    alert('Vous n\'avez pas les permissions pour accéder à cette page');
    window.location.href = '/account';
}

async function chargerCommande() {
    const token = getToken();
    
    if (!token) {
        window.location.href = "/signin";
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/commandes/${commandeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/ld+json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();

        console.log('✅ Données commande:', data);
        console.log('📋 Menus:', data.menus);

        // Charger le titre du menu
        let titreMenu = 'N/A';
        if (data.menus && data.menus.length > 0) {
            const menuUrl = typeof data.menus[0] === 'string' 
                ? data.menus[0] 
                : data.menus[0]['@id'] || `/api/menus/${data.menus[0].id}`;
            
            console.log('🔗 URL du menu:', menuUrl);
            
            try {
                const menuResponse = await fetch(`http://127.0.0.1:8000${menuUrl}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/ld+json'
                    }
                });
                
                if (menuResponse.ok) {
                    const menuData = await menuResponse.json();
                    console.log('✅ Données menu:', menuData);
                    titreMenu = menuData.titre;
                    console.log('📝 Titre extrait:', titreMenu);
                }
            } catch (error) {
                console.error('⚠️ Erreur chargement menu:', error);
            }
        }

        // Remplir les champs d'affichage
        const numeroEl = document.getElementById('numero');
        const dateCommandeEl = document.getElementById('dateCommande');
        const titreEl = document.getElementById('titre');
        const prixMenuEl = document.getElementById('prixMenu');

        if (numeroEl) numeroEl.textContent = data.numero_commande;
        if (dateCommandeEl) dateCommandeEl.textContent = new Date(data.date_commande).toLocaleDateString('fr-FR');
        if (titreEl) titreEl.textContent = titreMenu;
        if (prixMenuEl) prixMenuEl.textContent = data.prix_menu?.toFixed(2) + ' €';

        // Remplir les champs du formulaire (basiques)
        const datePrestationEl = document.getElementById('datePrestation');
        const heureLivEl = document.getElementById('heureLiv');
        const nbPersonnesEl = document.getElementById('nbPersonnes');
        const pretMatEl = document.getElementById('pretMat');
        const prixLivEl = document.getElementById('prixLiv');

        if (datePrestationEl && data.date_prestation) {
            datePrestationEl.value = data.date_prestation.split('T')[0];
        }
        
        if (heureLivEl && data.heure_liv) {
            const heureMatch = data.heure_liv.match(/T(\d{2}:\d{2})/);
            if (heureMatch) {
                heureLivEl.value = heureMatch[1];
            }
        }
        
        if (nbPersonnesEl) {
            nbPersonnesEl.value = data.nombre_personne || 1;
        }
        
        if (pretMatEl) {
            pretMatEl.checked = data.pret_mat || false;
        }

        if (prixLivEl) {
            prixLivEl.value = data.prix_liv || 0;
        }

        // Méthode de contact
        const telEl = document.getElementById('contactTel');
        const mailEl = document.getElementById('contactMail');

        if (data.contactMethod) {
         if (data.contactMethod === 'Tel' || data.contactMethod === 'contactTel') {
                if (telEl) telEl.checked = true;
            } else if (data.contactMethod === 'Mail' || data.contactMethod === 'contactMail') {
                if (mailEl) mailEl.checked = true;
            }
        }

        // Motif de modification
        const motifEl = document.getElementById('modification_reason');
        if (motifEl && data.modificationReason) {
            motifEl.value = data.modificationReason;
        }

        // Modifié par (lecture seule)
        const modifiedByEl = document.getElementById('modifiedBy');
        if (modifiedByEl && data.modifiedBy) {
            // Si modifiedBy est un objet avec @id, charger les infos user
            if (typeof data.modifiedBy === 'string') {
                try {
                    const userResponse = await fetch(`http://127.0.0.1:8000${data.modifiedBy}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/ld+json'
                        }
                    });
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        modifiedByEl.textContent = `${userData.nom} ${userData.prenom}`;
                    }
                } catch (error) {
                    console.error('⚠️ Erreur chargement user:', error);
                    modifiedByEl.textContent = 'N/A';
                }
            } else if (data.modifiedBy.nom) {
                modifiedByEl.textContent = `${data.modifiedBy.nom} ${data.modifiedBy.prenom || ''}`;
            }
        } else if (modifiedByEl) {
            modifiedByEl.textContent = 'Aucune modification';
        }

        // Date de modification (lecture seule)
        const modifiedAtEl = document.getElementById('modifiedAt');
        if (modifiedAtEl && data.ModifiedAt) {
            modifiedAtEl.textContent = new Date(data.ModifiedAt).toLocaleString('fr-FR');
        } else if (modifiedAtEl) {
            modifiedAtEl.textContent = '-';
        }

        console.log('✅ Formulaire rempli avec succès');

    } catch (error) {
        console.error('❌ Erreur lors du chargement:', error);
        const messageEl = document.getElementById('message');
        if (messageEl) {
            messageEl.textContent = 'Erreur lors du chargement de la commande';
            messageEl.style.color = 'red';
        }
    }
}

// Gérer la soumission du formulaire
const formCommande = document.getElementById('formCommande');
if (formCommande) {
    formCommande.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = getToken();

        if (!token) {
            alert('Session expirée, veuillez vous reconnecter');
            window.location.href = "/signin";
            return;
        }

        // Payload de base
        const payload = {
            date_prestation: document.getElementById('datePrestation').value,
            heure_liv: document.getElementById('heureLiv').value,
            nombre_personne: parseInt(document.getElementById('nbPersonnes').value),
            pret_mat: document.getElementById('pretMat').checked
        };

        // Champs admin
        const telChecked = document.getElementById('contactTel')?.checked;
        const mailChecked = document.getElementById('contactMail')?.checked;

        if (telChecked) {
            payload.contactMethod = 'Tel';  
        } else if (mailChecked) {
            payload.contactMethod = 'Mail';
        }
        // Ne pas envoyer null, ne pas inclure le champ si rien n'est coché

        const motif = document.getElementById('modification_reason')?.value;
        if (motif && motif.trim() !== '') {
            payload.modificationReason = motif;
        }

        // ModifiedBy et ModifiedAt seront gérés automatiquement côté backend
        // avec l'utilisateur connecté et la date actuelle

        console.log('📤 Envoi des modifications (ADMIN):', payload);

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/commandes/${commandeId}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/merge-patch+json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/ld+json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Commande modifiée avec succès');
                window.location.href = '/account';
            } else {
                const errorData = await response.json();
                console.error('❌ Erreur serveur:', errorData);
                const messageEl = document.getElementById('message');
                if (messageEl) {
                    messageEl.textContent = errorData['hydra:description'] || 'Erreur lors de la modification';
                    messageEl.style.color = 'red';
                }
            }
        } catch (error) {
            console.error('❌ Erreur réseau:', error);
            const messageEl = document.getElementById('message');
            if (messageEl) {
                messageEl.textContent = 'Erreur réseau';
                messageEl.style.color = 'red';
            }
        }
    });
}

// Bouton retour
const btnRetour = document.getElementById('btnRetour');
if (btnRetour) {
    btnRetour.addEventListener('click', () => {
        window.location.href = '/account';
    });
}

const btnAnnuler = document.getElementById('btnAnnuler');
if (btnAnnuler) {
    btnAnnuler.addEventListener('click', async () => {
        if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;

        const token = getToken();

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/commandes/${commandeId}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/merge-patch+json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/ld+json'
                },
                body: JSON.stringify({ statut: 'Annulé' })
            });

            if (response.ok) {
                alert('Commande annulée');
                window.location.href = '/account';
            } else {
                document.getElementById('message').textContent = 'Erreur lors de l\'annulation';
            }
        } catch (error) {
            console.error('❌ Erreur:', error);
            document.getElementById('message').textContent = 'Erreur réseau';
        }
    });
}

// Gestion des checkbox exclusives pour méthode de contact
const contactTel = document.getElementById('contactTel');
const contactMail = document.getElementById('contactMail');

if (contactTel && contactMail) {
    contactTel.addEventListener('change', () => {
        if (contactTel.checked) {
            contactMail.checked = false;
        }
    });

    contactMail.addEventListener('change', () => {
        if (contactMail.checked) {
            contactTel.checked = false;
        }
    });
}

// Charger la commande au démarrage
chargerCommande();