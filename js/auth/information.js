console.log("🚀 Script information.js chargé");

console.log("🔍 window.onPageLoadedInformation existe?", typeof window.onPageLoadedInformation);

function initInformationPage() {
    console.log("🎯 initInformationPage appelée");
    
    const btnMaj = document.getElementById("btnMaj");
    console.log("🔍 Bouton trouvé:", btnMaj);

    // Gestionnaire de clic sur le bouton
    if (btnMaj) {
        btnMaj.addEventListener("click", checkCredentials);
        console.log("✅ Event listener ajouté au bouton");
    } else {
        console.error("❌ Bouton 'btnMaj' introuvable dans le DOM");
        console.log("📋 IDs disponibles:", 
            Array.from(document.querySelectorAll('[id]')).map(el => el.id)
        );
    }
}

function checkCredentials(event) {
    console.log("🎯 checkCredentials appelée");
    event.preventDefault();
    
    const token = localStorage.getItem('apiToken');
    console.log("🔑 Token:", token ? "présent" : "absent");
    
    if (!token) {
        alert("Vous devez être connecté pour effectuer cette action");
        return;
    }
    
    // Récupérer les valeurs des champs
    const telephone = document.getElementById("telInput")?.value || null;
    const codeP = document.getElementById("codePInput")?.value || null;
    const adresse = document.getElementById("adresseInput")?.value || null;
    const ville = document.getElementById("villeInput")?.value || null;

    console.log("📝 Valeurs récupérées:", { telephone, codeP, adresse, ville });

    // Vérifier qu'au moins un champ est renseigné
    if (!telephone && !codeP && !adresse && !ville) {
        alert("Veuillez renseigner au moins un champ à modifier");
        return;
    }

    envoyerDonnees(token, telephone, adresse, codeP, ville);
}

function envoyerDonnees(token, telephone, adresse, codeP, ville) {
    console.log("📤 envoyerDonnees appelée");
    
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);
    
    // Créer l'objet data avec seulement les champs renseignés
    const data = {};
    
    if (telephone) data.tel = telephone;
    if (adresse) data.adresse = adresse;
    if (codeP) data.codeP = codeP;
    if (ville) data.ville = ville;
    
    console.log("📤 Données envoyées:", data);
    
    const requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify(data),
        redirect: "follow"
    };
    
    // Récupérer l'ID depuis localStorage
    const userId = localStorage.getItem('userId');
    console.log("👤 User ID:", userId);
    
    if (!userId) {
        alert("Erreur : ID utilisateur non trouvé. Veuillez vous reconnecter.");
        return;
    }
    
    // Vérifier que apiUrl est défini
    if (typeof apiUrl === 'undefined') {
        console.error("❌ apiUrl n'est pas défini !");
        alert("Erreur de configuration : URL de l'API manquante");
        return;
    }
    
    const endpoint = `${apiUrl}users/${userId}`;
    console.log("🔗 Endpoint appelé:", endpoint);

    fetch(endpoint, requestOptions)
        .then((response) => {
            console.log("📨 Statut réponse:", response.status);
            
            const contentType = response.headers.get("content-type");
            
            if (!response.ok) {
                return response.text().then(text => {
                    console.error("❌ Réponse erreur:", text);
                    throw new Error(`Erreur HTTP ${response.status}: ${text || 'Pas de détails'}`);
                });
            }
            
            if (!contentType || !contentType.includes("application/json")) {
                console.log("✅ Succès (pas de JSON)");
                return response.text();
            }
            
            return response.json();
        })
        .then((result) => {
            console.log("✅ Succès:", result);
            alert("Vos informations ont été modifiées avec succès!");
        })
        .catch((error) => {
            console.error("❌ Erreur complète:", error);
            alert("Erreur lors de la modification: " + error.message);
        });
}

// Fonction pour le Router (au cas où)
window.onPageLoadedInformation = function () {
    console.log("✅ onPageLoadedInformation appelée par le router");
    initInformationPage();
};

// AJOUT : Appel direct avec un petit délai pour laisser le DOM se charger
console.log("⏳ Attente du DOM...");
setTimeout(() => {
    console.log("✅ Appel direct de initInformationPage");
    initInformationPage();
}, 100);
