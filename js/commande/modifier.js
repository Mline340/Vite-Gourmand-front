console.log("🔵 Page modification commande chargé !");
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

async function chargerCommande() {
    const token = getToken();
    
    if (!token) {
        window.location.href = "/signin";
        return;
    }

    try {
        const response = await fetch(`https://vite-gourmand-back.onrender.com/api/commandes/${commandeId}`, {
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
    // Le menu peut être un objet ou une URL string
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
        // On continue même si le menu ne charge pas
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

        // Remplir les champs du formulaire
        const datePrestationEl = document.getElementById('datePrestation');
        const heureLivEl = document.getElementById('heureLiv');
        const nbPersonnesEl = document.getElementById('nbPersonnes');
        const pretMatEl = document.getElementById('pretMat');

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

        const payload = {
            date_prestation: document.getElementById('datePrestation').value,
            heure_liv: document.getElementById('heureLiv').value,
            nombre_personne: parseInt(document.getElementById('nbPersonnes').value),
            pret_mat: document.getElementById('pretMat').checked
        };

        console.log('📤 Envoi des modifications:', payload);

        try {
            const response = await fetch(`https://vite-gourmand-back.onrender.com/api/commandes/${commandeId}`, {
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
                document.getElementById('message').textContent = 'Erreur lors de la modification';
            }
        } catch (error) {
            console.error('❌ Erreur réseau:', error);
            document.getElementById('message').textContent = 'Erreur réseau';
        }
    });
}

const btnAnnuler = document.getElementById('btnAnnuler');
if (btnAnnuler) {
    btnAnnuler.addEventListener('click', async () => {
        if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;

        const token = getToken();

        try {
            const response = await fetch(`https://vite-gourmand-back.onrender.com/api/commandes/${commandeId}`, {
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

// Charger la commande au démarrage
chargerCommande();