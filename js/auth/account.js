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
      window.location.href = "/signin";
      return;
    }

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log("✅ Données utilisateur reçues:", data);
    
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