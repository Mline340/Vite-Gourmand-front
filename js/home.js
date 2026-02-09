// FONCTION DE SÉCURITÉ CONTRE XSS
function escapeHtml(text) {
    if (!text) return 'Non renseigné';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function loadAvis() {
    try {
        const url = `${apiUrl}avis/valides?statut=validé&order[dateCreation]=desc&pagination=false`;
        console.log("📡 URL appelée:", url);
        
        const response = await fetch(url);
        
        console.log("📊 Statut réponse:", response.status);
        
        if (!response.ok) {
            console.error('Erreur HTTP:', response.status);
            const errorText = await response.text();
            console.error('Détail erreur:', errorText);
            return;
        }
        
        const data = await response.json();
        console.log('📦 Données complètes:', data);

        const avis = data['hydra:member'] || data.member || [];
        console.log('📌 Avis à afficher:', avis);

        displayAvis(avis);
    } catch (error) {
        console.error('Erreur chargement avis:', error);
    }
}

function displayAvis(avis) {
    const container = document.getElementById('avisContainer');
    
    if (!container) {
        console.error('❌ CONTAINER INTROUVABLE');
        return;
    }

    // ✅ Vider le container de façon sécurisée
    container.replaceChildren();
    
    avis.forEach(a => {
        // Créer la carte d'avis
        const card = document.createElement('div');
        card.className = 'avis-card';
        
        // Rating
        const rating = document.createElement('div');
        rating.className = 'rating';
        rating.textContent = '★'.repeat(a.note) + '☆'.repeat(5 - a.note);
        card.appendChild(rating);
        
        // Infos (auteur + date)
        const info = document.createElement('small');
        info.className = 'text-muted';
        const auteur = a.user ? `${escapeHtml(a.user.prenom)} ${escapeHtml(a.user.nom)}` : 'Anonyme';
        const date = new Date(a.dateCreation).toLocaleDateString();
        info.textContent = `Par ${auteur} - ${date}`;
        card.appendChild(info);
        
        // Description
        const description = document.createElement('p');
        description.className = 'mt-2';
        description.textContent = a.description; // ✅ textContent protège contre XSS
        card.appendChild(description);
        
        container.appendChild(card);
    });
    
    setupCarousel(avis.length);
}

function setupCarousel(total) {
    let current = 0;
    const container = document.getElementById('avisContainer');
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) prevBtn.onclick = () => {
        current = (current - 1 + total) % total;
        container.style.transform = `translateX(-${current * 100}%)`;
    };
    
    if (nextBtn) nextBtn.onclick = () => {
        current = (current + 1) % total;
        container.style.transform = `translateX(-${current * 100}%)`;
    };
}

let attempts = 0;

function waitForContainer() {
    attempts++;
    console.log(`🔍 Tentative ${attempts}/10`);
    
    const container = document.getElementById('avisContainer');
    
    if (container) {
        console.log("✅ Container trouvé !");
        loadAvis();
    } else if (attempts < 10) {
        setTimeout(waitForContainer, 100);
    } else {
        console.error("❌ ABANDON après 10 tentatives");
    }
}

window.addEventListener('pageLoaded', waitForContainer);