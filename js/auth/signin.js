const mailInput = document.getElementById("EmailInput");
const passwordInput = document.getElementById("PasswordInput"); 
const btnSignin = document.getElementById("btnSignin"); 
const signinForm = document.getElementById("signinForm"); 

btnSignin.addEventListener("click", checkCredentials); 

// Fonction pour décoder le JWT et extraire l'userId
function getUserIdFromToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        
        const payload = JSON.parse(jsonPayload);
        console.log("📋 Contenu du token décodé:", payload);
        
        return payload.id || payload.user_id || payload.userId || payload.sub;
    } catch (error) {
        console.error("❌ Erreur décodage token:", error);
        return null;
    }
}

function checkCredentials(event){
    // IMPORTANT : Empêcher le comportement par défaut du formulaire
    if (event) {
        event.preventDefault();
    }
    
    console.log("🔴 BOUTON CLIQUÉ - Fonction checkCredentials appelée");
    console.log("Email:", mailInput.value);
    console.log("Password:", passwordInput.value);
    
    // Vérification de la variable apiUrl
    console.log("🌐 apiUrl:", typeof apiUrl !== 'undefined' ? apiUrl : "❌ UNDEFINED");
    
    if (typeof apiUrl === 'undefined') {
        console.error("❌ ERREUR CRITIQUE: La variable apiUrl n'est pas définie !");
        alert("Erreur de configuration : apiUrl non définie");
        return;
    }

    const myHeaders = new Headers(); 
    myHeaders.append("Content-Type", "application/json"); 

    const raw = JSON.stringify({
        "email": mailInput.value,   
        "password": passwordInput.value
    }); 
    
    console.log("📤 Données envoyées:", raw);
    console.log("📍 URL complète:", apiUrl + "login");
    
    const requestOptions = { 
        method: "POST", 
        headers: myHeaders, 
        body: raw, 
        redirect: "follow" 
    }; 
    
    console.log("🚀 Lancement de la requête fetch...");
    
    fetch(apiUrl + "login", requestOptions) 
    .then(response => {
        console.log("📥 Réponse reçue - Status:", response.status);
        console.log("📥 Réponse OK:", response.ok);
        
        if(response.ok){ 
            return response.json(); 
        } else { 
            mailInput.classList.add("is-invalid"); 
            passwordInput.classList.add("is-invalid"); 
            throw new Error("Identifiants invalides - Status: " + response.status);
        } 
    }) 
    .then(async result => { 
        console.log("✅ Résultat complet de l'API:", result);
        console.log("📋 Structure de la réponse:", JSON.stringify(result, null, 2));

          // Vérifier s'il y a une erreur
            if (result.error) {
                alert(result.error);
                return;
            }
        
        // ===== STOCKAGE DU TOKEN =====
        const token = result.apiToken; 
        if (!token) {
            console.error("❌ Aucun token reçu de l'API");
            alert("Erreur de connexion : token manquant");
            return;
        }
        
        console.log("✅ Token reçu:", token);
        localStorage.setItem("apiToken", token);
        
        // ===== STOCKAGE DU RÔLE =====
        if (result.roles && result.roles.length > 0) {
            const role = result.roles[0]; // Prendre le premier rôle
            localStorage.setItem("role", role);
            console.log("✅ Rôle stocké:", role);
        }
        
        // ===== STOCKAGE DE L'USER ID =====
        if (result.userId) {
            localStorage.setItem("userId", result.userId);
            console.log("✅ UserId stocké:", result.userId);
        } else {
            console.error("❌ userId introuvable dans la réponse de l'API");
            console.log("📋 Vérifiez que votre backend retourne bien 'userId'");
        }
        
        const userToStore = {
            id: result.userId,
            email: result.user,
            role: result.roles ? result.roles[0] : 'user'
        };
    
        sessionStorage.setItem('user', JSON.stringify(userToStore));
        console.log('✅ Données utilisateur stockées après connexion');
        // ===== VÉRIFICATION FINALE =====
        console.log("🔍 VÉRIFICATION FINALE:");
        const verif = {
            token: localStorage.getItem("apiToken"),
            userId: localStorage.getItem("userId"),
            role: localStorage.getItem("role")
        };
        console.log("Données stockées:", verif);
        
        // Pause de 100ms pour s'assurer que localStorage est bien écrit
        setTimeout(() => {
            console.log("🚀 Redirection vers la page d'accueil...");
            window.location.replace("/");
        }, 100); 
    }) 
    .catch(error => {
        console.error('❌ ERREUR FETCH:', error);
        console.error('❌ Message:', error.message);
        console.error('❌ Stack:', error.stack);
    });
    
    console.log("✅ Fin de la fonction checkCredentials (fetch lancé en async)");
}

// Si le formulaire existe, empêcher sa soumission par défaut
if (signinForm) {
    signinForm.addEventListener("submit", function(e) {
        e.preventDefault();
        console.log("📝 Form submit intercepté");
        checkCredentials(e);
    });
}