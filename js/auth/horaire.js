const API_URL = "http://localhost:8000/api";

async function loadHoraires() {
    try {
        const response = await fetch(`${API_URL}/horaires`);
        const data = await response.json();
        
        displayHoraires(data['hydra:member']);
    } catch (error) {
        console.error("Erreur:", error);
    }
}

function displayHoraires(horaires) {
    const container = document.getElementById("horaires-list");
    
    let html = '<div class="table-responsive"><table class="table table-striped">';
    html += '<thead><tr><th>Jour</th><th>Ouverture</th><th>Fermeture</th><th>Actions</th></tr></thead><tbody>';
    
    horaires.forEach(horaire => {
        html += `
            <tr>
                <td>${horaire.jour}</td>
                <td><input type="time" class="form-control" value="${horaire.heure_ouverture || ''}" id="ouverture-${horaire.id}"></td>
                <td><input type="time" class="form-control" value="${horaire.heure_fermeture || ''}" id="fermeture-${horaire.id}"></td>
                <td><button class="btn btn-primary btn-sm" onclick="updateHoraire(${horaire.id})">Enregistrer</button></td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

async function updateHoraire(id) {
    const ouverture = document.getElementById(`ouverture-${id}`).value;
    const fermeture = document.getElementById(`fermeture-${id}`).value;
    
    try {
        const response = await fetch(`${API_URL}/horaires/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/ld+json',
            },
            body: JSON.stringify({
                heure_ouverture: ouverture,
                heure_fermeture: fermeture
            })
        });
        
        if (response.ok) {
            alert("Horaire mis à jour !");
        }
    } catch (error) {
        console.error("Erreur:", error);
    }
}

loadHoraires();