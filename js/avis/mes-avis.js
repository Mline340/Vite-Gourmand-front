console.log("🔵 Page mes avis chargés !");

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
    
   container.innerHTML = avis.map(a => `
        <div class="card mb-3 avis-card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="card-title">
                            Commande #${a.commande?.numero_commande || a.commande?.id || 'N/A'}
                            <span class="rating">${'★'.repeat(a.note)}${'☆'.repeat(5-a.note)}</span>
                        </h5>
                        <p class="text-muted mb-2">
                            <small><i class="bi bi-calendar"></i> ${new Date(a.dateCreation).toLocaleDateString('fr-FR')}</small>
                        </p>
                        <p class="card-text">${a.description || 'Aucun commentaire'}</p>
                    </div>
                    <div>
                        <span class="badge bg-${a.statut === 'Validé' ? 'success' : a.statut === 'Rejeté' ? 'danger' : 'warning'}">
                            ${a.statut}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
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