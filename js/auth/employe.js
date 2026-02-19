// Attendre que le DOM soit chargé
setTimeout(() => {
    const token = localStorage.getItem('apiToken');
    
    // CORRECTION : Utiliser le bon ID
    const formEmploye = document.getElementById("formulaireEmploye");
    const btnValidationEmploye = document.getElementById("btn-validation-employe");
    const inputMail = document.getElementById("EmailInput");
    const inputPassword = document.getElementById("PasswordInput");
    const inputValidatePassword = document.getElementById("ValidatePasswordInput");
    const inputNom = document.getElementById("NomInput");
    const inputPrenom = document.getElementById("PrenomInput");

    console.log("✅ Formulaire trouvé:", formEmploye);
    console.log("✅ Token:", token);

    if (!formEmploye) {
        console.error("❌ Formulaire toujours non trouvé!");
        return;
    }

    // Validation
    function validateRequired(input) {
        if (!input) return false;
        if (input.value.trim() !== "") {
            input.classList.add("is-valid");
            input.classList.remove("is-invalid");
            return true;
        } else {
            input.classList.add("is-invalid");
            input.classList.remove("is-valid");
            return false;
        }
    }

    function validateMail(input) {
        if (!input) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (input.value.match(emailRegex)) {
            input.classList.add("is-valid");
            input.classList.remove("is-invalid");
            return true;
        } else {
            input.classList.remove("is-valid");
            input.classList.add("is-invalid");
            return false;
        }
    }

    function validatePassword(input) {
        if (!input) return false;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
        if (passwordRegex.test(input.value)) {
            input.classList.add("is-valid");
            input.classList.remove("is-invalid");
            return true;
        } else {
            input.classList.add("is-invalid");
            input.classList.remove("is-valid");
            return false;
        }
    }

    function validateConfirmPassword(inputPwd, inputConfirm) {
        if (!inputPwd || !inputConfirm) return false;
        if (inputPwd.value === inputConfirm.value && inputPwd.value.length > 0) {
            inputConfirm.classList.add("is-valid");
            inputConfirm.classList.remove("is-invalid");
            return true;
        } else {
            inputConfirm.classList.add("is-invalid");
            inputConfirm.classList.remove("is-valid");
            return false;
        }
    }

    function validateForm() {
        const nomOk = validateRequired(inputNom);
        const prenomOk = validateRequired(inputPrenom);
        const mailOk = validateMail(inputMail);
        const passwordOk = validatePassword(inputPassword);
        const confirmOk = validateConfirmPassword(inputPassword, inputValidatePassword);
        
        if (nomOk && prenomOk && mailOk && passwordOk && confirmOk) {
            btnValidationEmploye.disabled = false;
        } else {
            btnValidationEmploye.disabled = true;
        }
    }

    // Validation en temps réel
    inputNom?.addEventListener("input", validateForm);
    inputPrenom?.addEventListener("input", validateForm);
    inputMail?.addEventListener("input", validateForm);
    inputPassword?.addEventListener("input", validateForm);
    inputValidatePassword?.addEventListener("input", validateForm);

    // Création d'employé
    async function createEmployee(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log("🚀 Création d'employé en cours...");

        const email = inputMail.value.trim();
        const password = inputPassword.value;
        const nom = inputNom.value.trim();
        const prenom = inputPrenom.value.trim();

        console.log("📤 Données:", { email, nom, prenom });

        if (!token) {
            alert('❌ Vous devez être connecté en tant qu\'administrateur');
            return;
        }

        btnValidationEmploye.disabled = true;
        btnValidationEmploye.textContent = "Création en cours...";

        try {
            const response = await fetch(apiUrl + 'employees', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, nom, prenom })
            });

            console.log("📥 Réponse:", response.status);
            const data = await response.json();
            console.log("📦 Données:", data);

            if (response.ok) {
                alert('✅ Employé créé avec succès !');
                formEmploye.reset();
                window.location.href = '/admin';
            } else {
                alert('❌ Erreur : ' + (data.detail || 'Impossible de créer l\'employé'));
            }
        } catch (error) {
            console.error('❌ Erreur:', error);
            alert('❌ Erreur de connexion : ' + error.message);
        } finally {
            btnValidationEmploye.textContent = "Créer l'employé";
            validateForm();
        }
    }

    formEmploye.addEventListener('submit', createEmployee);
    console.log("✅ Event listener attaché");
    
}, 200);