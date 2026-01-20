function getAuthHeaders() {
    const token = localStorage.getItem('apiToken');
    console.log('🔑 Token:', token ? 'Existe' : 'MANQUANT');
    if (!token) {
        alert('Session expirée, reconnectez-vous');
        window.location.href = '/login';
        return {};
    }
    return {
        'Content-Type': 'application/ld+json',
        'Authorization': `Bearer ${token}`
    };
}


async function loadHoraires() {

    const user = JSON.parse(localStorage.getItem('user'));
    console.log('👤 User role:', user?.roles);
    
    try {
        const response = await fetch(`${apiUrl}horaires`, {
        headers: getAuthHeaders()
        });
        const data = await response.json();
        
        console.log("📦 Données reçues:", data);
        
        if (!data || !data.member || data.member.length === 0) {
            console.log('Aucune donnée d\'horaires reçue - création par défaut');
            displayHoraires([]);
        } else {
            displayHoraires(data.member); 
        }
    } catch (error) {
        console.error('Erreur:', error);
        displayHoraires([]);
    }
}
function displayHoraires(horaires) {
    const container = document.getElementById("horaires-list");
    
    if (!horaires || horaires.length === 0) {
        const joursDefaut = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        horaires = joursDefaut.map(jour => ({
            id: null,
            jour: jour,
            heure_ouverture: '',
            heure_fermeture: '',
            note: ''
        }));
    }
    
    let html = '<div class="table-responsive"><table class="table table-striped">';
    html += '<thead><tr><th>Jour</th><th>Ouverture</th><th>Fermeture</th><th>Note</th></tr></thead><tbody>';
    
    horaires.forEach((horaire, index) => {
        console.log(`📋 Horaire ${index}:`, horaire);
    const horaireId = horaire.id || `new-${index}`;
    
    let ouverture = '';
    let fermeture = '';
    let note = '';
    
    if (horaire.heure_ouverture && horaire.heure_ouverture !== 'NULL') {
        ouverture = horaire.heure_ouverture.substring(0, 5);
    }
    
    if (horaire.heure_fermeture && horaire.heure_fermeture !== 'NULL') {
        fermeture = horaire.heure_fermeture.substring(0, 5);
    }
    
    if (horaire.note && horaire.note !== 'NULL') {
        note = horaire.note;
    }
    
    html += `
        <tr data-id="${horaire.id || ''}" data-jour="${horaire.jour}">
            <td>${horaire.jour}</td>
            <td><input type="time" class="form-control" value="${ouverture}" id="ouverture-${horaireId}"></td>
            <td><input type="time" class="form-control" value="${fermeture}" id="fermeture-${horaireId}"></td>
            <td><input type="text" class="form-control" placeholder="Ex: Fermé" value="${note}" id="note-${horaireId}"></td>
        </tr>
    `;
});
    console.log('🎨 HTML généré:', html);
    html += '</tbody></table></div>';
    html += '<button class="btn btn-primary mt-3" onclick="saveAllHoraires()"><i class="bi bi-save me-2"></i>Enregistrer tous les horaires</button>'; 
    container.innerHTML = html;
}

async function saveAllHoraires() {
    const rows = document.querySelectorAll('#horaires-list tbody tr');
    const promises = [];
    
    rows.forEach((row, index) => {
        const id = row.dataset.id;
        const jour = row.dataset.jour;
        const horaireId = id || `new-${index}`;
        
        const ouvertureEl = document.getElementById(`ouverture-${horaireId}`);
        const fermetureEl = document.getElementById(`fermeture-${horaireId}`);
        const noteEl = document.getElementById(`note-${horaireId}`);
        
        if (!ouvertureEl || !fermetureEl || !noteEl) {
            console.warn(`Éléments manquants pour ${horaireId}`);
            return;
        }
            console.log(`🔍 Row ${index}:`, {
                horaireId,
                ouverture_value: ouvertureEl.value,
                fermeture_value: fermetureEl.value,
                note_value: noteEl.value
            });

        const ouverture = ouvertureEl.value.trim() || null;
        const fermeture = fermetureEl.value.trim() || null;
        const note = noteEl.value || null;
        
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${apiUrl}horaires/${id}` : `${apiUrl}horaires`;
        
        const bodyData = { jour: jour };
        if (ouverture) bodyData.heure_ouverture = ouverture;
        if (fermeture) bodyData.heure_fermeture = fermeture;
        if (note) bodyData.note = note;
        
        console.log('📤 Données envoyées:', {
            method: method,
            url: url,
            body: bodyData
        });

        const promise = fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(bodyData)
        });
        
        promises.push(promise);
    });
    
    try {
        await Promise.all(promises);
        alert("Tous les horaires ont été enregistrés !");
        loadHoraires();
    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur lors de l'enregistrement");
    }
}

loadHoraires();