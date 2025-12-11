const inputNom = document.getElementById("NomInput");
const inputPrenom = document.getElementById("PrenomInput");
const inputTelephone = document.getElementById("TelephoneInput");
const inputMail= document.getElementById("EmailInput");
const inputAdresse = document.getElementById("AdresseInput");
const inputCodePostal = document.getElementById("code_postalInput");
const inputVille = document.getElementById("VilleInput");
const inputPassword = document.getElementById("PasswordInput");
const inputValidationPassword = document.getElementById("ValidatePasswordInput");
const btnValidation = document.getElementById("btn-validation-inscription");
const formInscription = document.getElementById("formulaireInscription");


inputNom.addEventListener("keyup", validateForm);
inputPrenom.addEventListener("keyup", validateForm);
inputTelephone.addEventListener("keyup", validateForm);
inputMail.addEventListener("keyup", validateForm);
inputAdresse.addEventListener("keyup", validateForm);
inputCodePostal.addEventListener("keyup", validateForm);
inputVille.addEventListener("keyup", validateForm);
inputPassword.addEventListener("keyup", validateForm);
inputValidationPassword.addEventListener("keyup", validateForm);

btnValidation.addEventListener("click", InscrireUtilisateur);
 
function validateForm(){
    const nomOk = validateRequired(inputNom);
    const prenomOk = validateRequired(inputPrenom);
    const telephoneOk = validateRequired(inputTelephone);
    const mailOk = validateMail(inputMail);
    const adresseOk = validateRequired(inputAdresse);
    const CodePostalOk = validateRequired(inputCodePostal);
    const villeOk = validateRequired(inputVille);
    const passwordOk = validatePassword(inputPassword);
    const passwordconfirmOk = validateConfirmationPassword (inputPassword, inputValidationPassword);
    
    if(nomOk && prenomOk && telephoneOk && mailOk && adresseOk && CodePostalOk && villeOk &&  passwordOk && passwordconfirmOk){
        btnValidation.disabled = false;
    }
    else{
        btnValidation.disabled = true;

    }
}
    

function validateConfirmationPassword(inputPwd, inputConfirmPwd){
    if(inputPwd.value == inputConfirmPwd.value){
        inputConfirmPwd.classList.add("is-valid");
        inputConfirmPwd.classList.remove("is-invalid");
        return true;
    }
    else{
        inputConfirmPwd.classList.add("is-invalid");
        inputConfirmPwd.classList.remove("is-valid");
        return false;
    }
}

function validatePassword(input){
    //definir mon regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{10,}$/;
    const passwordUser = input.value;
    if(passwordUser.match(passwordRegex)){
         input.classList.add("is-valid");
        input.classList.remove("is-invalid");
        return true;
    }
    else{
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}
function validateMail(input){
    //definir mon regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mailUser = input.value;
    if(mailUser.match(emailRegex)){
         input.classList.add("is-valid");
        input.classList.remove("is-invalid");
        return true;
    }
    else{
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

function validateRequired(input){
    if(input.value != ''){
        input.classList.add("is-valid");
        input.classList.remove("is-invalid"); 
        return true;
    }
    else{
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

function InscrireUtilisateur(){
    let dataForm = new FormData(formInscription);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
       
    const raw = JSON.stringify({
        "nom": dataForm.get("nom"),
        "prenom": dataForm.get("prenom"),
        "email": dataForm.get("email"),
        "password": dataForm.get("password"),
        "tel": dataForm.get("telephone"),
        "adresse": dataForm.get("ville"),
        "codeP": dataForm.get("code_postal"),
        "ville": dataForm.get("ville")
        
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch(apiUrl+"registration", requestOptions)
     .then(response => {
        if(response.ok){
            return response.json();
        }
        else{
            alert("Erreur lors de l'inscription");
        }
    })
    .then(result => {
        alert("Bravo "+dataForm.get("prenom")+", vous êtes maintenant inscrit, vous pouvez vous connecter.");
        document.location.href="/signin";
    })
    .catch(error => console.log('error', error));
};