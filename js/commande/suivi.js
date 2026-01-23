console.log("🔵 Page suivi commande chargé !");
const commandeId = new URLSearchParams(window.location.search).get('id');

function getToken() {
    return localStorage.getItem("apiToken");
}

const etapesStatuts = [
    'En attente',
    'Accepté',
    'En préparation',
    'En cours de livraison',
    'Livré',
    'En attente du retour de matériel',
    'Terminé'
];

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
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('Données commande:', data);
        
        document.getElementById('numero').textContent = data.numero_commande;
        document.getElementById('dateCommande').textContent = new Date(data.date_commande).toLocaleDateString('fr-FR');
        document.getElementById('commandeStatut').textContent = data.statut;
        
        afficherSuiviStatut(data.statut, data.ModifiedAt || data.date_commande);
        
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('errorMessage').textContent = 'Erreur lors du chargement de la commande';
        document.getElementById('errorMessage').style.display = 'block';
    }
}

function afficherSuiviStatut(statutActuel, dateModification) {
    const container = document.getElementById('suiviStatut');
    const indexActuel = etapesStatuts.indexOf(statutActuel);
    
    let html = '';
    
    etapesStatuts.forEach((statut, index) => {
        const isActuel = index === indexActuel;
        const isComplete = index < indexActuel;
        
        html += `
            <div class="d-flex align-items-start mb-3">
                <div class="me-3">
                    <div class="rounded-circle d-flex align-items-center justify-content-center" 
                         style="width: 35px; height: 35px; background: ${isComplete || isActuel ? '#4CAF50' : '#ddd'}; color: white; font-weight: bold;">
                        ${index + 1}
                    </div>
                </div>
                <div>
                    <h6 class="mb-0" style="${isActuel ? 'font-weight: bold;' : ''}">${statut}</h6>
                    ${isActuel ? `<small class="text-muted">Statut actuel - Mis à jour le ${new Date(dateModification).toLocaleDateString('fr-FR')} à ${new Date(dateModification).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</small>` : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

chargerCommande();