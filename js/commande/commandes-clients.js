console.log("🔵 Commande clients chargées !");

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

let toutesLesCommandes = []; 

function getStatutsSuivantsPossibles(statutActuel) {
    const transitions = {
        'En attente': ['Accepté', 'Annulé'],
        'Accepté': ['En préparation', 'Annulé'],
        'En préparation': ['En cours de livraison', 'Annulé'],
        'En cours de livraison': ['Livré', 'Annulé'],
        'Livré': ['En attente du retour de matériel', 'Terminé'],
        'En attente du retour de matériel': ['Terminé'],
        'Terminé': [],
        'Annulé': []
    };
    
    return [statutActuel, ...(transitions[statutActuel] || [])];
}

// Récupérer et afficher les commandes
async function fetchCommandes() {
    try {
        const token = localStorage.getItem('apiToken');
        
        // 1. Récupérer tous les utilisateurs
        const response = await fetch(apiUrl + 'users', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        
        // Vérification importante
        if (!data || !data.member) {  // Changé ici
            console.error('❌ Données invalides reçues:', data);
            document.getElementById('orders-list').innerHTML = `<div class="alert alert-danger">Aucune donnée disponible</div>`;
            return;
        }
        
        // 2. Récupérer chaque utilisateur avec ses commandes
        const usersWithOrders = await Promise.all(
            data.member.map(async (user) => {  
                const userResponse = await fetch(apiUrl+`users/${user.id}`, {
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

        toutesCommandes.sort((a, b) => {
    return new Date(b.date_commande) - new Date(a.date_commande);
});

        toutesLesCommandes = toutesCommandes; 
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
        // ✅ SÉCURISATION : Échapper toutes les données utilisateur
        const numeroCommande = escapeHtml(commande.numero_commande);
        const clientNom = escapeHtml(commande.clientNom);
        const clientPrenom = escapeHtml(commande.clientPrenom);
        const clientTel = escapeHtml(commande.clientTel || 'N/A');
        const clientAdresse = escapeHtml(commande.clientAdresse || 'N/A');
        const clientCodeP = escapeHtml(commande.clientCodeP || 'N/A');
        const clientVille = escapeHtml(commande.clientVille || 'N/A');
        const commentaire = escapeHtml(commande.commentaire);
        const modificationReason = escapeHtml(commande.modificationReason);
        const contactMethod = escapeHtml(commande.contactMethod);
        
        // Échapper les titres de menus
        const menusHtml = commande.menus?.map(menu => 
            `<span class="badge bg-secondary me-2">${escapeHtml(menu.titre)}</span>`
        ).join('') || 'N/A';
        
        // Dates (pas de risque XSS, ce sont des dates)
        const dateCommande = new Date(commande.date_commande).toLocaleDateString('fr-FR');
        const datePrestation = new Date(commande.date_prestation).toLocaleDateString('fr-FR');
        const heureLiv = commande.heure_liv ? 
            new Date(commande.heure_liv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 
            'N/A';
        
        // Informations modifiées
        const modifiedByNom = commande.modifiedBy ? escapeHtml(commande.modifiedBy.nom) : '';
        const modifiedByPrenom = commande.modifiedBy ? escapeHtml(commande.modifiedBy.prenom) : '';
        const modifiedAt = commande.ModifiedAt ? 
            `${new Date(commande.ModifiedAt).toLocaleDateString('fr-FR')} à ${new Date(commande.ModifiedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : 
            '';
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
                            <h6 class="text-primary mt-3">Menu(s)</h6>
                            ${commande.menus?.map(menu => `<span class="badge bg-secondary me-2">${menu.titre}</span>`).join('') || 'N/A'}
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-primary">Détails Commande</h6>
                            <p><strong>Date commande:</strong> ${new Date(commande.date_commande).toLocaleDateString('fr-FR')}</p>
                            <p><strong>Date prestation:</strong> ${new Date(commande.date_prestation).toLocaleDateString('fr-FR')}</p>
                            <p><strong>Heure livraison:</strong> ${commande.heure_liv ? new Date(commande.heure_liv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                            <p><strong>Nombre de personnes:</strong> ${commande.nombre_personne || 'N/A'}</p>
                            <p><strong>Prix menu:</strong> ${commande.prix_menu}€</p>
                            <p><strong>Prix livraison:</strong> ${commande.prix_liv || 0}€</p>
                            <p><strong>Prêt matériel:</strong> ${commande.pret_mat ? 'Oui' : 'Non'}</p>
                            ${commande.pret_mat ? `<p><strong>Retour matériel:</strong> ${commande.retour_mat ? 'Oui' : 'Non'}</p>` : ''}
                            <p><strong>Statut:</strong> 
                            ${(() => {
                                const statutsPossibles = getStatutsSuivantsPossibles(commande.statut);
                                const isBloque = commande.statut === 'Terminé' || commande.statut === 'Annulé';
        
                                let optionsHtml = '';
                                statutsPossibles.forEach(statut => {
                                    const selected = statut === commande.statut ? 'selected' : '';
                                    optionsHtml += `<option value="${statut}" ${selected}>${statut}</option>`;
                             });
        
                                return `<select class="form-select form-select-sm d-inline-block w-auto" 
                                         onchange="updateStatut(${commande.id}, this.value)" 
                                            ${isBloque ? 'disabled' : ''}>
                                            ${optionsHtml}
                                        </select>`;
                            })()}
                        </p>
                        </div>
                    </div>
                    ${commande.commentaire ? `
                    <div class="mt-3">
                        <h6 class="text-primary">Commentaire</h6>
                        <p class="fst-italic">${commande.commentaire}</p>
                    </div>` : ''}
                    ${commande.modificationReason || commande.modifiedBy || commande.ModifiedAt ? `
                    <div class="mt-3 alert alert-warning">
                        <h6 class="text-warning mb-2"><i class="bi bi-exclamation-triangle me-1"></i>Modification(s)</h6>
                        ${commande.contactMethod ? `<p><strong>Méthode de contact:</strong> ${commande.contactMethod}</p>` : ''}
                        ${commande.modificationReason ? `<p><strong>Raison:</strong> ${commande.modificationReason}</p>` : ''}
                        ${commande.modifiedBy ? `<p><strong>Modifié par:</strong> ${commande.modifiedBy.nom} ${commande.modifiedBy.prenom}</p>` : ''}
                        ${commande.ModifiedAt ? `<p><strong>Date modification:</strong> ${new Date(commande.ModifiedAt).toLocaleDateString('fr-FR')} à ${new Date(commande.ModifiedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>` : ''}
                    </div>` : ''}
                </div>
            </div>
            
        `;
    });
    
    container.innerHTML = html;
}

async function updateStatut(commandeId, nouveauStatut) {
    const token = localStorage.getItem('apiToken');
    if (!token) {
        alert('Vous devez être connecté pour modifier le statut');
        return;
    }
    
    try {
        const response = await fetch(apiUrl + `commandes/${commandeId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/merge-patch+json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ statut: nouveauStatut })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erreur serveur:', errorData);
            alert(errorData.detail || `Erreur: ${response.status}`);
            throw new Error(errorData.detail);
        }

        alert('Statut mis à jour avec succès');
        await fetchCommandes(); // Recharge les commandes
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Charger la liste des clients dans le select
async function loadClients() {
    try {
        const token = localStorage.getItem('apiToken');
        const response = await fetch(apiUrl + 'users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        const clientSelect = document.getElementById('client');
        if (data.member) {  
            data.member.forEach(user => {  
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.nom} ${user.prenom}`;
                clientSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erreur chargement clients:', error);
    }
}

// Fonction de filtrage
function filtrerCommandes() {
    const statut = document.getElementById('statut').value;
    const clientId = document.getElementById('client').value;
    const typeDate = document.getElementById('typeDate').value;
    const dateDebut = document.getElementById('dateDebut').value;
    const dateFin = document.getElementById('dateFin').value;

    let commandesFiltrees = [...toutesLesCommandes];

    // Filtre par statut
    if (statut) {
        commandesFiltrees = commandesFiltrees.filter(cmd => cmd.statut === statut);
    }

    // Filtre par client
    if (clientId) {
        commandesFiltrees = commandesFiltrees.filter(cmd => cmd.user && cmd.user.id == clientId);
    }

   // Filtre par date
if (dateDebut || dateFin) {
    commandesFiltrees = commandesFiltrees.filter(cmd => {
        const dateCommande = new Date(cmd[typeDate]);
        dateCommande.setHours(0, 0, 0, 0);
        
        const debut = dateDebut ? new Date(dateDebut + 'T00:00:00') : null;
        const fin = dateFin ? new Date(dateFin + 'T23:59:59') : null;

        if (debut && fin) {
            return dateCommande >= debut && dateCommande <= fin;
        } else if (debut) {
            return dateCommande >= debut;
        } else if (fin) {
            return dateCommande <= fin;
        }
        return true;
    });
}

    afficherCommandes(commandesFiltrees);
}

// Initialisation
function initFilters() {
    console.log("🚀 Initialisation des filtres...");
    
    const btnFiltre = document.getElementById('btnFiltre');
    const btnReset = document.getElementById('btnReset');
    
    if (btnFiltre) {
        btnFiltre.addEventListener('click', filtrerCommandes);
        console.log("✅ Event listener ajouté sur btnFiltre");
    }
    
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            document.getElementById('statut').value = '';
            document.getElementById('client').value = '';
            document.getElementById('typeDate').value = 'date_commande';
            document.getElementById('dateDebut').value = '';
            document.getElementById('dateFin').value = '';
            afficherCommandes(toutesLesCommandes);
        });
        console.log("✅ Event listener ajouté sur btnReset");
    }
}

// Lancer au chargement
console.log("🚀 Lancement de fetchCommandes()...");
fetchCommandes();
loadClients();

// Initialiser les filtres après un court délai pour s'assurer que le DOM est prêt
setTimeout(initFilters, 100);