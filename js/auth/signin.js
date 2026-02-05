const mailInput = document.getElementById("EmailInput");
const passwordInput = document.getElementById("PasswordInput"); 
const btnSignin = document.getElementById("btnSignin"); 
const signinForm = document.getElementById("signinForm"); 

btnSignin.addEventListener("click", checkCredentials); 

async function checkCredentials(event){
    if (event) event.preventDefault();
    
    console.log("🔴 Connexion en cours...");

    try {
        const response = await fetch(apiUrl + "login", {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: mailInput.value,   
                password: passwordInput.value
            })
        });

        console.log("📥 Status:", response.status);

        if (!response.ok) {
            mailInput.classList.add("is-invalid"); 
            passwordInput.classList.add("is-invalid");
            throw new Error("Identifiants invalides");
        }

        const result = await response.json();
        console.log("✅ Résultat:", result);

        if (!result.apiToken) throw new Error("Token manquant");

        localStorage.setItem("apiToken", result.apiToken);
        if (result.roles?.[0]) localStorage.setItem("role", result.roles[0]);
        if (result.userId) localStorage.setItem("userId", result.userId);

        sessionStorage.setItem('user', JSON.stringify({
            id: result.userId,
            email: result.user,
            role: result.roles?.[0] || 'user'
        }));

        console.log("✅ Connexion réussie");
        setTimeout(() => window.location.replace("/"), 100);

    } catch (error) {
        console.error('❌ ERREUR:', error.message);
        alert("Erreur de connexion");
    }
}

if (signinForm) {
    signinForm.addEventListener("submit", checkCredentials);
}