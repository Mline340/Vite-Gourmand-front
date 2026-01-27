let avisData = [];
let filtreActif = 'En attente';

function getToken() {
    return localStorage.getItem("apiToken");
}

async function chargerAvis() {
    const token = getToken();
    
    if (!token) {
        window.location.href = "/signin";
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/avis', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Erreur chargement avis');
        
        const data = await response.json();
        console.log('📥 Données reçues:', data); // LOG DEBUG
        
        // Gérer différents formats de réponse
        if (Array.isArray(data)) {
            avisData = data;
        } else if (data['hydra:member']) {
            avisData = data['hydra:member'];
        } else if (data.member) {  
            avisData = data.member;
        } else {
            console.error('Format inattendu:', data);
            avisData = [];
        }
        
        console.log('📊 Avis chargés:', avisData.length); 
        console.log('🔍 Premier avis:', avisData[0]);
        
        mettreAJourCompteurs();
        afficherAvis();
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement des avis');
    }
}
function mettreAJourCompteurs() {
    const attente = avisData.filter(a => a.statut === 'En attente').length;
    const valide = avisData.filter(a => a.statut === 'Validé').length;
    const rejete = avisData.filter(a => a.statut === 'Rejeté').length;
    
    document.getElementById('countAttente').textContent = attente;
    document.getElementById('countValide').textContent = valide;
    document.getElementById('countRejete').textContent = rejete;
}

function afficherAvis() {
    const avisFiltres = avisData.filter(a => a.statut === filtreActif);
    const container = document.getElementById('listeAvis');
    
    if (avisFiltres.length === 0) {
        container.innerHTML = '<p class="text-muted">Aucun avis dans cette catégorie</p>';
        return;
    }
    
    container.innerHTML = avisFiltres.map(avis => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="card-title">
                            Commande #${avis.commande?.numero_commande || avis.commande?.id || 'N/A'}
                            ${genererEtoiles(avis.note)}
                        </h5>
                        <p class="text-muted mb-2">
                        <i class="bi bi-person"></i> ${avis.user ? `${avis.user.prenom} ${avis.user.nom}` : 'Anonyme'}
                        <small class="ms-2"><i class="bi bi-calendar"></i> ${new Date(avis.dateCreation).toLocaleDateString('fr-FR')}</small>
                        </p>
                        <p class="card-text">${avis.description || 'Aucun commentaire'}</p>
                    </div>
                    <div>
                        ${avis.statut === 'En attente' ? `
                            <button class="btn btn-sm btn-success me-2" onclick="modifierStatut(${avis.id}, 'Validé')">
                                <i class="bi bi-check-circle"></i> Valider
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="modifierStatut(${avis.id}, 'Rejeté')">
                                <i class="bi bi-x-circle"></i> Rejeter
                            </button>
                        ` : `
                            <span class="badge bg-${avis.statut === 'Validé' ? 'success' : 'danger'}">
                                ${avis.statut}
                            </span>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function genererEtoiles(note) {
    let etoiles = '';
    for (let i = 1; i <= 5; i++) {
        etoiles += `<i class="bi bi-star${i <= note ? '-fill' : ''}" style="color: #FFD700;"></i>`;
    }
    return etoiles;
}

async function modifierStatut(avisId, nouveauStatut) {
    const token = getToken();
    
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/avis/${avisId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/merge-patch+json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                statut: nouveauStatut
            })
        });
        
        if (!response.ok) throw new Error('Erreur modification statut');
        
        await chargerAvis();
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la modification du statut');
    }
}

// Gestion des onglets
document.querySelectorAll('#avisTabs .nav-link').forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('#avisTabs .nav-link').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        filtreActif = tab.dataset.filter;
        afficherAvis();
    });
});

chargerAvis();