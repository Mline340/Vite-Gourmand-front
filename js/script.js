const apiUrl = "http://127.0.0.1:8000/api/";
const signoutBtn = document.getElementById("signout-btn");

if (signoutBtn) {
    signoutBtn.addEventListener("click", signout);
}

// ===== GESTION DU TOKEN =====
function setToken(token) {
    localStorage.setItem("apiToken", token);
}

function getToken() {
    return localStorage.getItem("apiToken");
}

// ===== GESTION DU ROLE =====
function setRole(role) {
    localStorage.setItem("role", role);
}

function getRole() {
    return localStorage.getItem("role");
}

// ===== GESTION DE L'USER ID =====
function setUserId(userId) {
    localStorage.setItem("userId", userId);
}

function getUserId() {
    return localStorage.getItem("userId");
}

// ===== DÉCONNEXION =====
function signout() {
    localStorage.removeItem("apiToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.location.href = "/signin";
}

// ===== VÉRIFICATION DE CONNEXION =====
function isConnected() {
    const token = getToken();
    // On vérifie seulement le token, pas le userId
    return token !== null && token !== undefined && token !== "";
}

// ===== AFFICHAGE SELON RÔLES =====
/*
Valeurs possibles pour data-show :
- disconnected : visible uniquement si déconnecté
- connected : visible uniquement si connecté
- admin : visible uniquement si admin connecté
- employe : visible uniquement si employé connecté
- user : visible uniquement si user connecté
*/
function showAndHideElementsForRoles() {
    const userConnected = isConnected();
    const role = getRole();

    console.log("🔐 État connexion:", userConnected ? "✅ Connecté" : "❌ Déconnecté");
    console.log("👤 Rôle:", role || "Aucun");

    let allElementsToEdit = document.querySelectorAll('[data-show]');

    allElementsToEdit.forEach(element => {
        element.classList.remove("d-none");

        const allowedRoles = element.dataset.show.split(',').map(r => r.trim());
        
        // Si contient "disconnected"
        if(allowedRoles.includes('disconnected') && userConnected) {
            element.classList.add("d-none");
        }
        // Si contient "connected"
        else if(allowedRoles.includes('connected') && !userConnected) {
            element.classList.add("d-none");
        }
        // Si contient des rôles spécifiques (admin, employe, user)
        else if(!allowedRoles.includes('disconnected') && !allowedRoles.includes('connected')) {
            if(!userConnected || !allowedRoles.includes(role)) {
                element.classList.add("d-none");
                // Pour les modales, on désactive aussi leur ouverture
                if(element.classList.contains('modal')) {
                    element.setAttribute('data-bs-backdrop', 'false');
                    element.setAttribute('data-bs-keyboard', 'false');
                    element.style.display = 'none !important';
                }
            }
        }
    });
}
// Lancer l'affichage au chargement de la page
document.addEventListener("DOMContentLoaded", showAndHideElementsForRoles);