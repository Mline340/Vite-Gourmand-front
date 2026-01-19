
console.log("🔵 Page modification commande chargé !");
const commandeId = new URLSearchParams(window.location.search).get('id');

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
        const response = await fetch(`http://127.0.0.1:8000/api/commandes/${commandeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        console.log('Données commande:', data);
        console.log('Menus:', data.menus);

        // Charger le titre du menu
        let titreMenu = 'N/A';
        if (data.menus && data.menus.length > 0) {
            const menuResponse = await fetch(`http://127.0.0.1:8000${data.menus[0]}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const menuData = await menuResponse.json();
            console.log('Données menu:', menuData);
            titreMenu = menuData.titre;
            console.log('Titre extrait:', titreMenu);
        }

        document.getElementById('numero').textContent = data.numero_commande;
        document.getElementById('dateCommande').textContent = new Date(data.date_commande).toLocaleDateString('fr-FR');
        document.getElementById('titre').textContent = titreMenu;
        document.getElementById('prixMenu').textContent = data.prix_menu.toFixed(2);

        document.getElementById('datePrestation').value = data.date_prestation.split('T')[0];
        document.getElementById('heureLiv').value = data.heure_liv.split('T')[1].substring(0, 5);
        document.getElementById('nbPersonnes').value = data.nombre_personne || 1;
        document.getElementById('pretMat').checked = data.pret_mat || false;
    } catch (error) {
        document.getElementById('message').textContent = 'Erreur lors du chargement de la commande';
    }
}

document.getElementById('formCommande').addEventListener('submit', async (e) => {
    e.preventDefault();


    const token = getToken();

    const payload = {
        date_prestation: document.getElementById('datePrestation').value,
        heure_liv: document.getElementById('heureLiv').value,
        nombre_personne: parseInt(document.getElementById('nbPersonnes').value),
        pret_mat: document.getElementById('pretMat').checked
    };

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/commandes/${commandeId}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/merge-patch+json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Commande modifiée avec succès');
            window.location.href = '/account';
        } else {
            document.getElementById('message').textContent = 'Erreur lors de la modification';
        }
    } catch (error) {
        document.getElementById('message').textContent = 'Erreur réseau';
    }
});

document.getElementById('btnAnnuler').addEventListener('click', async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;

    try {
        const response = await fetch(`${apiUrl}commandes/${commandeId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/merge-patch+json' },
            body: JSON.stringify({ statut: 'Annulé' })
        });

        if (response.ok) {
            alert('Commande annulée');
            window.location.href = '/account';
        } else {
            document.getElementById('message').textContent = 'Erreur lors de l\'annulation';
        }
    } catch (error) {
        document.getElementById('message').textContent = 'Erreur réseau';
    }
});

chargerCommande();