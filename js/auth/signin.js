const mailInput = document.getElementById("EmailInput");
const passwordInput = document.getElementById("PasswordInput"); 
const btnSignin = document.getElementById("btnSignin"); 
const signinForm =document.getElementById("signinForm"); 

btnSignin.addEventListener("click", checkCredentials); 

function checkCredentials(){
    //Ici, il faudra appeler l'API pour vérifier les credentials en BDD
    
    if(mailInput.value == "test@mail.com" && passwordInput.value == "123"){
        //Il faudra récupérer le vrai token
        const token = "lkjsdngfljsqdnglkjsdbglkjqskjgkfjgbqslkfdgbskldfgdfgsdgf";
        setToken(token);
        //placer ce token en cookie
        setCookie(RoleCookieName, "user", 7);
        window.location.replace("/");
   
    }
    else{
        mailInput.classList.add("is-invalid");
        passwordInput.classList.add("is-invalid");
    }
}