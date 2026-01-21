console.log("🔵 Commande clients chargées !");

// Récupérer et afficher les commandes
async function fetchCommandes() {
    console.log('🔍 Début fetchCommandes');
    try {
        const token = localStorage.getItem('apiToken');
        console.log('🔑 Token:', token ? 'présent' : 'absent');
        
        // 1. Récupérer la liste des utilisateurs
        const response = await fetch('http://localhost:8000/api/users', {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Status response:', response.status);
        const data = await response.json();
        console.log('📦 Data reçue:', data);
        
        // 2. Récupérer chaque utilisateur avec ses commandes
        const usersWithOrders = await Promise.all(
            data.member.map(async (user) => {
                const userResponse = await fetch(`http://localhost:8000/api/users/${user.id}`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                return await userResponse.json();
            })
        );
        
        console.log('👥 Users avec commandes:', usersWithOrders);
        
        // 3. Extraire toutes les commandes
        const toutesCommandes = [];

        for (const user of usersWithOrders) {
            console.log('👤 User:', user.nom, 'Commandes:', user.commandes);
            
            if (user.commandes && user.commandes.length > 0) {
                for (const commandeUrl of user.commandes) {
                    // Fetcher chaque commande
                    const commandeResponse = await fetch(`http://localhost:8000${commandeUrl}`, {
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    const commande = await commandeResponse.json();
                    console.log('🔍 Commande fetchée:', commande);
                    
                    // Ajouter les infos client
                    toutesCommandes.push({
                        ...commande,
                        clientNom: user.nom,
                        clientPrenom: user.prenom,
                        clientTel: user.tel,
                        clientAdresse: user.adresse,
                        clientCodeP: user.codeP,
                        clientVille: user.ville
                    });
                }
            }
        }
        
        console.log('📋 Toutes commandes:', toutesCommandes);
        afficherCommandes(toutesCommandes);
    } catch (err) {
        console.error('❌ Erreur:', err);
        document.getElementById('orders-list').innerHTML = `<div class="alert alert-danger">Erreur: ${err.message}</div>`;
    }
}

function afficherCommandes(commandes) {
    const container = document.getElementById('orders-list');
    
    if (commandes.length === 0) {
        container.innerHTML = '<p class="text-muted">Aucune commande trouvée.</p>';
        return;
    }
    
let html = '';
    commandes.forEach(commande => {
        html += `
            <div class="card mb-3">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">Commande N° ${commande.numero_commande}</h6>
                    <a href="/gerer?id=${commande.id}" class="btn btn-sm btn-outline-danger me-2">
                     <i class="bi bi-pencil-square me-1"></i>Modifier
                    </a>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="text-primary">Informations Client</h6>
                            <p><strong>Nom:</strong> ${commande.clientNom} ${commande.clientPrenom}</p>
                            <p><strong>Téléphone:</strong> ${commande.clientTel || 'N/A'}</p>
                            <p><strong>Adresse:</strong> ${commande.clientAdresse || 'N/A'}</p>
                            <p><strong>Code Postal:</strong> ${commande.clientCodeP || 'N/A'}</p>
                            <p><strong>Ville:</strong> ${commande.clientVille || 'N/A'}</p>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-primary">Détails Commande</h6>
                            <p><strong>Date commande:</strong> ${new Date(commande.date_commande).toLocaleDateString('fr-FR')}</p>
                            <p><strong>Date prestation:</strong> ${new Date(commande.date_prestation).toLocaleDateString('fr-FR')}</p>
                            <p><strong>Heure livraison:</strong> ${commande.heure_liv ? new Date(commande.heure_liv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                            <p><strong>Nombre de personnes:</strong> ${commande.nombre_personne || 'N/A'}</p>
                            <p><strong>Prix menu:</strong> ${commande.prix_menu}€</p>
                            <p><strong>Prix livraison:</strong> ${commande.prix_liv || 0}€</p>
                            <p><strong>Statut:</strong> <span class="badge bg-info">${commande.statut}</span></p>
                            <p><strong>Prêt matériel:</strong> ${commande.pret_mat ? 'Oui' : 'Non'}</p>
                            ${commande.pret_mat ? `<p><strong>Retour matériel:</strong> ${commande.retour_mat ? 'Oui' : 'Non'}</p>` : ''}
                        </div>
                    </div>
                    <div class="mt-3">
                        <h6 class="text-primary">Menu(s)</h6>
                        ${commande.menus?.map(menu => `<span class="badge bg-secondary me-2">${menu.titre}</span>`).join('') || 'N/A'}
                    </div>
                    ${commande.commentaire ? `
                    <div class="mt-3">
                        <h6 class="text-primary">Commentaire</h6>
                        <p class="fst-italic">${commande.commentaire}</p>
                    </div>` : ''}
                </div>
            </div>
            
        `;
    });
    
    container.innerHTML = html;
}

// Lancer la fonction au chargement de la page
console.log("🚀 Lancement de fetchCommandes()...");
fetchCommandes();