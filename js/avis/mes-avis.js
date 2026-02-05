console.log("🔵 Page mes avis chargés !");

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function loadMesAvis() {
    try {
        console.log('🌐 Appel API:', `${apiUrl}avis/mes-avis`);
        console.log('🔑 Token:', localStorage.getItem('apiToken'));
        
        const response = await fetch(`${apiUrl}avis/mes-avis`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('apiToken')}`
            }
        });
        
        console.log('📡 Statut réponse:', response.status);
        
        if (!response.ok) throw new Error('Erreur chargement');
        
        const data = await response.json();
        console.log('📦 Data reçue:', data);
        
        const avis = data['hydra:member'] || data.member || [];
        console.log('📝 Nombre d\'avis:', avis.length);
        console.log('📝 Avis:', avis);
        
        displayMesAvis(avis);
    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}
function displayMesAvis(avis) {
    const container = document.getElementById('mesAvisContainer');
    
    if (avis.length === 0) {
        container.innerHTML = '<p>Vous n\'avez pas encore déposé d\'avis.</p>';
        return;
    }
    
       container.innerHTML = avis.map(a => {
        // ✅ SÉCURISATION : Échapper toutes les données utilisateur
        const numeroCommande = escapeHtml(a.commande?.numero_commande || a.commande?.id || 'N/A');
        const description = escapeHtml(a.description || 'Aucun commentaire');
        const dateFormatee = new Date(a.dateCreation).toLocaleDateString('fr-FR');
        
        const etoilesPlein = '★'.repeat(a.note);
        const etoilesVide = '☆'.repeat(5 - a.note);
        
        // Couleur du badge selon statut (valeur contrôlée côté serveur)
        const badgeColor = a.statut === 'Validé' ? 'success' : 
                          a.statut === 'Rejeté' ? 'danger' : 'warning';
        
        return `
            <div class="card mb-3 avis-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="card-title">
                                Commande #${numeroCommande}
                                <span class="rating">${etoilesPlein}${etoilesVide}</span>
                            </h5>
                            <p class="text-muted mb-2">
                                <small><i class="bi bi-calendar"></i> ${dateFormatee}</small>
                            </p>
                            <p class="card-text">${description}</p>
                        </div>
                        <div>
                            <span class="badge bg-${badgeColor}">
                                ${a.statut}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

setTimeout(() => {
    console.log('🔍 Recherche du container...');
    const container = document.getElementById('mesAvisContainer');
    console.log('📦 Container trouvé:', container);
    if (container) {
        console.log('✅ Chargement des avis...');
        loadMesAvis();
    } else {
        console.error('❌ mesAvisContainer introuvable');
    }
}, 200);