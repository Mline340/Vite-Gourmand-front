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
        console.log('🔍 Premier avis complet:', JSON.stringify(avis[0], null, 2));
        console.log('🔍 User du premier avis:', avis[0]?.user);

        displayAvis(avis);
    } catch (error) {
        console.error('Erreur chargement avis:', error);
    }
}

function displayAvis(avis) {
    const container = document.getElementById('avisContainer');
    
    if (!container) {
        console.error('❌ CONTAINER INTROUVABLE - Vérifie que home.html contient bien id="avisContainer"');
        console.log('Contenu de main-page:', document.getElementById('main-page').innerHTML);
        return;
    }

    console.log('🔍 Premier avis avec user:', avis[0]);
    
    container.innerHTML = avis.map(a => `
        <div class="avis-card">
            <div class="rating">${'★'.repeat(a.note)}${'☆'.repeat(5-a.note)}</div>
            <small class="text-muted">Par ${a.user ? `${a.user.prenom} ${a.user.nom}` : 'Anonyme'} - ${new Date(a.dateCreation).toLocaleDateString()}</small>
            <p class="mt-2">${a.description}</p>
        </div>
    `).join('');
    
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

// Polling pour attendre le DOM
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
        console.log("📄 Contenu actuel de main-page:", document.getElementById('main-page').innerHTML);
    }
}

window.addEventListener('pageLoaded', waitForContainer);