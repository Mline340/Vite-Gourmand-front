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
        // Retirer d-none par défaut
        element.classList.remove("d-none");

        switch(element.dataset.show) {
            case 'disconnected': 
                if(userConnected) {
                    element.classList.add("d-none");
                }
                break;
            case 'connected': 
                if(!userConnected) {
                    element.classList.add("d-none");
                }
                break;
            case 'admin': 
                if(!userConnected || role !== "admin") {
                    element.classList.add("d-none");
                }
                break;
            case 'employe': 
                if(!userConnected || role !== "employe") {
                    element.classList.add("d-none");
                }
                break;
            case 'user': 
                if(!userConnected || role !== "user") {
                    element.classList.add("d-none");
                }
                break;
        }
    });
}

// Lancer l'affichage au chargement de la page
document.addEventListener("DOMContentLoaded", showAndHideElementsForRoles);