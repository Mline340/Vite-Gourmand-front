async function chargerEmployes() {
    try {
        const response = await fetch(`${apiUrl}admin/employes`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('apiToken')
            }
        });
        
        const employes = await response.json();
        console.log('✅ Employés reçus:', employes);
        
        afficherEmployes(employes);
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}
// Afficher dans le tableau
function afficherEmployes(employes) {
    const tbody = document.getElementById('liste-employes');
    tbody.innerHTML = '';
    
    employes.forEach(emp => {
        const tr = document.createElement('tr');
        
        const statut = emp.actif ? 'Actif' : 'Désactivé';
        const btnTexte = emp.actif ? 'Désactiver' : 'Réactiver';
        const btnClass = emp.actif ? 'btn-danger' : 'btn-success';
        
        tr.innerHTML = `
            <td>${emp.nom}</td>
            <td>${emp.email}</td>
            <td>${statut}</td>
            <td>
                <button class="${btnClass}" onclick="toggleEmploye(${emp.id})">
                    ${btnTexte}
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Activer/Désactiver un employé
async function toggleEmploye(id) {
    if (!confirm('Confirmer le changement de statut ?')) return;

    const token = localStorage.getItem('apiToken');
    console.log('🔑 Token utilisé:', token);
    
    try {
        const response = await fetch(`${apiUrl}employes/${id}/toggle`, {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('apiToken'),
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Statut modifié avec succès');
            chargerEmployes(); // Recharger la liste
        } else {
            alert('Erreur : ' + result.error);
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur réseau');
    }
}

// Charger au démarrage
chargerEmployes();