const inputTitre = document.getElementById("TitreInput");
const inputNbrPers = document.getElementById("NbrPersInput");
const inputPrixPers = document.getElementById("PrixPersInput");
const inputQuantite = document.getElementById("QuantiteInput");
const inputDescription = document.getElementById("DescriptionInput");
const inputRegime = document.getElementById("RegimeInput");
const inputTheme = document.getElementById("ThemeInput");
const inputAllergene = document.getElementById("AllergeneInput");
const inputTitrePlat = document.getElementById("TitrePlatInput");
const inputConditions = document.getElementById("ConditionsInput");
const inputPhoto = document.getElementById("PhotoInput");
const btnValidation = document.getElementById("btn-validation-menu");
const formMenu = document.getElementById("formulaireMenu");


inputTitre.addEventListener("keyup", validateForm);
inputNbrPers.addEventListener("keyup", validateForm);
inputPrixPers.addEventListener("keyup", validateForm);
inputQuantite.addEventListener("keyup", validateForm);
inputDescription.addEventListener("keyup", validateForm);
inputRegime.addEventListener("change", validateForm);
inputTheme.addEventListener("change", validateForm);
inputAllergene.addEventListener("change", validateForm);
inputTitrePlat.addEventListener("keyup", validateForm);
inputConditions.addEventListener("keyup", validateForm);
inputPhoto.addEventListener("change", validateForm);

btnValidation.addEventListener("click", NouveauMenu);
 
function validateForm(){
    const titreOk = validateRequired(inputTitre);
    const nbrPersOk = validateRequired(inputNbrPers);
    const prixPersOk = validateRequired(inputPrixPers);
    const quantiteOk = validateRequired(inputQuantite);
    const descriptionOk = validateRequired(inputDescription);
    const regimelOk = validateRequired(inputRegime);
    const themeOk = validateRequired(inputTheme);
    const allergenedOk = true;
    const titrePlatOk = validateRequired(inputTitrePlat);
    const conditionsOk = validateRequired(inputConditions);
    const photoOk = true;

    
    if(titreOk && nbrPersOk && prixPersOk && quantiteOk && descriptionOk && regimelOk && themeOk &&  allergenedOk && titrePlatOk &&  conditionsOk && photoOk){
        btnValidation.disabled = false;
    }
    else{
        btnValidation.disabled = true;

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

async function NouveauMenu(){
    let dataForm = new FormData(formMenu);
    
    const allergeneSelect = document.getElementById("AllergeneInput");
    const allergenesSelected = Array.from(allergeneSelect.selectedOptions).map(option => parseInt(option.value));

    // Upload photo d'abord
    let photoPath = null;
    const photoFile = inputPhoto.files[0];
    
    if(photoFile){
        photoPath = await uploadPhoto(photoFile);
        if(!photoPath){
            alert("Erreur lors de l'upload de la photo");
            return;
        }
    }

    // Créer le menu
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + getToken());
       
    const raw = JSON.stringify({
        "titre": dataForm.get("titre"),
        "nombre_personne_mini": parseInt(dataForm.get("nombre_personne_mini")),
        "prix_par_personne": parseFloat(dataForm.get("prix_par_personne")),
        "description": dataForm.get("description"),
        "quantite_restante": parseInt(dataForm.get("quantite_restante")),
        "conditions": dataForm.get("conditions"),
        "regimeId": parseInt(dataForm.get("regime")),
        "themeId": parseInt(dataForm.get("theme")),
        "plats": [
            {
                "titre_plat": dataForm.get("titre_plat"),
                "photo": photoPath,
                "allergeneIds": allergenesSelected
            }
        ]
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch(apiUrl+"menus", requestOptions)
    .then(response => {
        return response.json().then(data => {
            if(response.ok){
                return data;
            } else {
                console.error("Erreur serveur:", data);
                throw new Error(data.message || "Erreur lors de l'enregistrement");
            }
        });
    })
    .then(result => {
        alert("Menu ajouté avec succès !");
        document.location.href="/createmenu";
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert("Erreur: " + error.message);
    });
}

async function uploadPhoto(file){
    const formData = new FormData();
    formData.append("photo", file);
    
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + getToken());
    
    try {
        const response = await fetch(apiUrl + "upload/photo", {
            method: "POST",
            headers: myHeaders,
            body: formData
        });
        
        if(response.ok){
            const data = await response.json();
            return data.path;
        } else {
            console.error("Erreur upload");
            return null;
        }
    } catch(error){
        console.error("Erreur:", error);
        return null;
    }
};