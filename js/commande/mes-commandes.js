console.log("🔵 Page mes commandes chargée !");

function escapeHtml(text) {
  if (!text) return 'Non renseigné';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}


const commandeId = new URLSearchParams(window.location.search).get('id');

function getToken() {
    const token = localStorage.getItem("apiToken");
    console.log("🔑 Token récupéré:", token ? "✅ Présent" : "❌ Absent");
    return token;
}

async function loadUserOrders() {
  console.log("🟣 loadUserOrders() appelée");
  const token = getToken();
  const userId = localStorage.getItem("userId");
  console.log("👤 userId:", userId);

   if (!token || !userId) {
        console.error("❌ Token ou userId manquant - STOP");
        return;
    }

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
     console.log("📥 Réponse status:", response.status);

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const commandes = await response.json();
    console.log("✅ Commandes reçues:", commandes);

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
        console.error("❌ CRITICAL: #orders-list introuvable dans le DOM !");
        return;
    }

    if (!commandes || commandes.length === 0) {
        console.log("⚠️ Aucune commande à afficher");
        container.innerHTML = "<p class='text-center'>Aucune commande trouvée.</p>";
        return;
    }

    console.log("✅ Rendu de", commandes.length, "commandes");

  container.innerHTML = commandes.map(cmd => `
    <div class="card mb-3 shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="mb-0"><i class="bi bi-box me-2"></i> ${escapeHtml(cmd.numero_commande)}</h6>
          <span class="badge ${
              cmd.statut === 'Annulé' ? 'bg-danger' : 
              cmd.statut === 'Terminé' ? 'bg-success' : 
              cmd.statut === 'En attente' ? 'bg-warning text-dark' : 
             'bg-secondary'
            }"> ${escapeHtml(cmd.statut)}</span>
        </div>
        <hr>
        <div class="row">
            <div class="col-md-6">
              <p class="mb-2"><strong>Date commande :</strong> ${new Date(cmd.date_commande).toLocaleDateString('fr-FR')}</p>
              <p class="mb-2"><strong>Date prestation :</strong> ${new Date(cmd.date_prestation).toLocaleDateString('fr-FR')} à ${new Date(cmd.heure_liv).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</p>
              <p class="mb-2"><strong>Personnes :</strong> ${escapeHtml(String(cmd.nombre_personne))}</p>
              </div>
         <div class="col-md-6">   
              <p class="mb-2"><strong>Prix menu :</strong> ${escapeHtml(String(cmd.prix_menu))} €</p>
              <p class="mb-2"><strong>Prix liv :</strong> ${escapeHtml(String(cmd.prix_liv))} €</p>
              <p class="mb-2"><strong>Matériel prêt :</strong> ${cmd.pret_mat ? "Oui" : "Non"}</p>
              <p class="mb-2"><strong>Matériel retourné :</strong> ${cmd.retour_mat ? "Oui" : "Non"}</p>
          </div>
        </div>
       <hr>
                <div class="d-flex justify-content-end gap-2">
                    ${cmd.statut === 'Terminé' && !cmd.avisDepose ? 
                    `<a href="/avis?id=${encodeURIComponent(cmd.id)}" class="btn btn-sm btn-outline-success">
                        <i class="bi bi-star me-1"></i>Donner un avis
                    </a>` : 
                    cmd.statut === 'Terminé' && cmd.avisDepose ?
                    `<span class="btn btn-sm btn-outline-secondary disabled">
                        <i class="bi bi-check-circle me-1"></i>Avis déposé
                    </span>` :
                    ''}
                    <a href="/suivi?id=${encodeURIComponent(cmd.id)}" class="btn btn-sm btn-outline-secondary">
                        <i class="bi bi-eye me-1"></i>Suivi
                    </a>
                </div>
            </div>
        </div>
  `).join("");
  console.log("✅ Rendu HTML terminé");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadUserOrders);
} else {
    loadUserOrders();
}