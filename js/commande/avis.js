console.log("🔵 Page avis chargée !");

const commandeId = new URLSearchParams(window.location.search).get('id');
let noteSelectionnee = 0;

function getToken() {
    return localStorage.getItem("apiToken");
}

// Gestion des étoiles
document.querySelectorAll('.etoile').forEach(etoile => {
    etoile.addEventListener('click', function() {
        noteSelectionnee = parseInt(this.dataset.note);
        document.getElementById('note').value = noteSelectionnee;
        
        // Mettre à jour l'affichage des étoiles
        document.querySelectorAll('.etoile').forEach((e, index) => {
            if (index < noteSelectionnee) {
                e.classList.remove('bi-star');
                e.classList.add('bi-star-fill');
                e.style.color = '#FFD700';
            } else {
                e.classList.remove('bi-star-fill');
                e.classList.add('bi-star');
                e.style.color = '#ddd';
            }
        });
    });
    
    // Effet hover
    etoile.addEventListener('mouseenter', function() {
        const note = parseInt(this.dataset.note);
        document.querySelectorAll('.etoile').forEach((e, index) => {
            if (index < note) {
                e.style.color = '#FFD700';
            }
        });
    });
    
    etoile.addEventListener('mouseleave', function() {
        document.querySelectorAll('.etoile').forEach((e, index) => {
            if (index < noteSelectionnee) {
                e.style.color = '#FFD700';
            } else {
                e.style.color = '#ddd';
            }
        });
    });
});

// Charger les infos de la commande
async function chargerCommande() {
    const token = getToken();
    
    if (!token) {
        window.location.href = "/signin";
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/commandes/${commandeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Erreur chargement commande');
        
        const data = await response.json();
        document.getElementById('numeroCommande').textContent = data.numero_commande;
        
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('errorMessage').textContent = 'Erreur lors du chargement';
        document.getElementById('errorMessage').style.display = 'block';
    }
}

// Soumission du formulaire
document.getElementById('formAvis').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (noteSelectionnee === 0) {
        document.getElementById('errorMessage').textContent = 'Veuillez sélectionner une note';
        document.getElementById('errorMessage').style.display = 'block';
        return;
    }
    
    const token = getToken();
    const commentaire = document.getElementById('commentaire').value;
    let response;
    
try {
    const response = await fetch('http://127.0.0.1:8000/api/avis', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            commandeId: parseInt(commandeId),  
            note: noteSelectionnee,
            description: commentaire,
            statut: false
        })
    });
    
    if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('Détails erreur API:', errorData);
    throw new Error('Erreur envoi avis');
    }
    
  const updateResponse = await fetch(`http://127.0.0.1:8000/api/commandes/${commandeId}`, {
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/merge-patch+json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        avisDepose: true
    })
});

if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    console.error('Erreur mise à jour commande:', errorText);
}
    document.getElementById('successMessage').textContent = 'Merci ! Votre avis a été envoyé et sera publié après validation.';
    document.getElementById('successMessage').style.display = 'block';
    document.getElementById('formAvis').style.display = 'none';
    
    setTimeout(() => {
        window.location.href = '/mes-commandes';
    }, 2000);
    
} catch (error) {
    console.error('Erreur:', error);
    if (response) {
        const errorData = await response.json().catch(() => null);
        console.error('Détails erreur API:', errorData);
    }
    document.getElementById('errorMessage').textContent = 'Erreur lors de l\'envoi de votre avis';
    document.getElementById('errorMessage').style.display = 'block';
}
});

chargerCommande();