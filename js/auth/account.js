console.log("🔵 Script chargé !");

function getToken() {
  // ✅ CORRECTION : utiliser "apiToken" au lieu de "token"
  return localStorage.getItem("apiToken");
}

// Fonction principale pour charger le compte
async function loadAccountPage() {
  console.log("🟢 loadAccountPage() appelée !");
  
  // Récupération du token et userId
  const token = getToken();
  const userId = localStorage.getItem("userId");

  console.log("🔍 Données récupérées du localStorage:");
  console.log("- Token:", token ? "✅ Présent (" + token.substring(0, 20) + "...)" : "❌ Absent");
  console.log("- UserId:", userId ? "✅ Présent (" + userId + ")" : "❌ Absent");

  // Vérification de la connexion - STOP si pas de token/userId
  if (!token || !userId) {
    console.error("❌ Authentification manquante -> redirection vers /signin");
    localStorage.removeItem("apiToken");
    localStorage.removeItem("userId");
    window.location.href = "/signin";
    return;
  }

  console.log("✅ Token et userId trouvés, appel API...");

  // Construction de l'URL avec l'ID utilisateur
  const endpoint = `http://127.0.0.1:8000/api/users/${userId}`;
  console.log("📡 URL API:", endpoint);

  try {
    // Appel API pour récupérer les infos utilisateur
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log("📡 Statut réponse API:", response.status);
    
    if (response.status === 401) {
      console.error("❌ Token invalide/expiré (401)");
      localStorage.removeItem("apiToken");
      localStorage.removeItem("userId");
      sessionStorage.removeItem("user");
      window.location.href = "/signin";
      return;
    }

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log("✅ Données utilisateur reçues:", data);

        const userToStore = {
            id: data.id,
            email: data.email,
            firstname: data.firstname,
            lastname: data.lastname,
            phone: data.phone,
            address: data.address,
            role: data.role
        };

    // ✅ On stocke l'objet complet pour les autres pages (commande, profil, etc.)
        sessionStorage.setItem('user', JSON.stringify(userToStore));
        console.log('✅ Données utilisateur stockées dans sessionStorage:', userToStore);
    
    // Affichage des informations utilisateur
    const userInfoElement = document.getElementById("user-info");

    if (userInfoElement) {
      userInfoElement.innerHTML = `
        <div>
          <p><strong>Nom Prénom : </strong>${(data.nom || '') + " " + (data.prenom || '') || 'Non renseigné'}</p>
          <p><strong>Email : </strong>${data.email || 'Non renseigné'}</p>
          <p><strong>Tel : </strong>${data.tel || 'Non renseigné'}</p>
          <p><strong>Rue : </strong>${data.adresse || 'Non renseigné'}</p>
          <p><strong>Ville : </strong>${(data.codeP || '') + " " + (data.ville || '') || 'Non renseigné'}</p>
        </div>
      `;
      console.log("✅ Informations affichées dans le DOM");
    } else {
      console.error("❌ Élément #user-info introuvable dans le DOM");
    }
    console.log("➡️ Appel loadUserOrders()");
    await loadUserOrders();
  } catch (error) {
    console.error("❌ ERREUR COMPLÈTE:", error);
    console.error("❌ Message:", error.message);
    
    const userInfoElement = document.getElementById("user-info");
    if (userInfoElement) {
      userInfoElement.innerHTML = `
        <div style="padding: 20px; background: #fee; border-radius: 10px; color: #c33;">
          <p><strong>⚠️ Impossible de charger vos informations</strong></p>
          <p style="font-size: 0.9em; margin-top: 10px;">Erreur: ${error.message}</p>
        </div>
      `;
    }
  }
}

//AFFICHER COMMANDE CLIENT
async function loadUserOrders() {
  console.log("🟣 loadUserOrders() appelée");

  const token = getToken();
  const userId = localStorage.getItem("userId");

  if (!token || !userId) return;

  const endpoint = `http://127.0.0.1:8000/api/commandes`;
  console.log("📡 URL commandes:", endpoint);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const commandes = await response.json();
    console.log("✅ Commandes reçues:", commandes);

    console.log("🔍 Type de commandes:", typeof commandes);
    console.log("🔍 Clés disponibles:", Object.keys(commandes));
    console.log("🔍 commandes.member:", commandes.member);
    console.log("🔍 commandes['member']:", commandes['member']);

    const commandesArray = commandes.member || commandes["hydra:member"] || [];
    console.log("📦 Nombre de commandes:", commandesArray.length);

    renderOrders(commandesArray);

  } catch (error) {
    console.error("❌ Erreur chargement commandes:", error.message);
  }
}

function renderOrders(commandes) {
    console.log("🎨 renderOrders appelée avec:", commandes);
    const container = document.getElementById("orders-list");
    console.log("📦 Container trouvé:", container);


  if (!container) {
    console.error("❌ #orders-list introuvable");
    return;
  }

  if (!commandes.length) {
    container.innerHTML = "<p>Aucune commande trouvée.</p>";
    return;
  }

  container.innerHTML = commandes.map(cmd => `
    <div class="card mb-3 shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="mb-0"><i class="bi bi-box me-2"></i> ${cmd.numero_commande}</h6>
          <span class="badge bg-warning text-dark"> ${cmd.statut}</span>
        </div>
        <hr>
        <div class="row">
            <div class="col-md-6">
              <p class="mb-2"><strong>Date commande :</strong> ${new Date(cmd.date_commande).toLocaleDateString('fr-FR')}</p>
              <p class="mb-2"><strong>Date prestation :</strong> ${new Date(cmd.date_prestation).toLocaleDateString('fr-FR')} à ${new Date(cmd.heure_liv).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</p>
              <p class="mb-2"><strong>Personnes :</strong> ${cmd.nombre_personne}</p>
            </div>
         <div class="col-md-6">   
              <p class="mb-2"><strong>Prix menu :</strong> ${cmd.prix_menu} €</p>
              <p class="mb-2"><strong>Prix liv :</strong> ${cmd.prix_liv} €</p>
              <p class="mb-2"><strong>Matériel prêt :</strong> ${cmd.pret_mat ? "Oui" : "Non"}</p>
              <p class="mb-2"><strong>Matériel retourné :</strong> ${cmd.retour_mat ? "Oui" : "Non"}</p>
          </div>
        </div>
       <hr>
                <div class="d-flex justify-content-end gap-2">
                    ${cmd.statut !== 'Accepté' && cmd.statut !== 'Terminé' ? 
                        `<a href="/commande/modifier/${cmd.id}" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-pencil me-1"></i>Modifier
                        </a>` : 
                        ''}
                    ${cmd.statut === 'Terminé' ? 
                        `<a href="/commande/avis/${cmd.id}" class="btn btn-sm btn-outline-success">
                            <i class="bi bi-star me-1"></i>Donner un avis
                        </a>` : 
                        ''}
                    <a href="/commande/suivi/${cmd.id}" class="btn btn-sm btn-outline-secondary">
                        <i class="bi bi-eye me-1"></i>Suivi
                    </a>
                </div>
            </div>
        </div>
  `).join("");
}



// Supprimer mon Compte 
window.supprimerMonCompte = async function() {
  console.log("🔴 Fonction de suppression appelée");
  
  const token = getToken();
  const userId = localStorage.getItem("userId");
  
  if (!token || !userId) {
    console.error("❌ Token ou userId manquant");
    alert("Erreur : informations de connexion manquantes");
    return;
  }
  
  // Confirmation avant suppression
  if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
    console.log("❌ Suppression annulée par l'utilisateur");
    return;
  }

  const endpoint = `http://127.0.0.1:8000/api/users/${userId}`;
  console.log("📡 Envoi requête DELETE vers:", endpoint);

  try {
    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    console.log("📡 Réponse reçue, statut:", response.status);

    if (response.ok) {
      console.log("✅ Compte supprimé avec succès");
      // Nettoyage et redirection
      localStorage.removeItem("apiToken");
      localStorage.removeItem("userId");
      alert("Votre compte a été supprimé avec succès");
      window.location.href = "/signin";
    } else {
      const errorText = await response.text();
      console.error("❌ Erreur lors de la suppression:", errorText);
      alert("Erreur lors de la suppression du compte : " + response.status);
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
    alert("Une erreur est survenue lors de la suppression");
  }
};
// Lancer la fonction au chargement de la page
console.log("🚀 Lancement de loadAccountPage()...");
loadAccountPage();

