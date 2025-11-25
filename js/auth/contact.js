/*const form = document.getElementById('contactForm');
const successMessage = document.querySelector('.success-message');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validation Bootstrap
    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    sendEmail()

    // Afficher le message de succès
    successMessage.style.display = 'block';
    form.reset();
    form.classList.remove('was-validated');

    // Masquer le message après 5 secondes
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 5000);
});

// Réinitialiser la validation lors du reset
form.addEventListener('reset', function() {
    form.classList.remove('was-validated');
    successMessage.style.display = 'none';
});

function sendEmail(mailEmetteur) {
    Email.send({
        Host: "smtp.yourisp.com",
        Username: "nom_utilisateur",
        Password: "password",
        To: 'destinataire@exemple.com',
        From: mailEmetteur,
        Subject: "Email de Test",
        Body: "Ceci est un email de test envoyé en utilisant SMTP.js"
    })
    .then(function (message) {
        alert("Email envoyé avec succès") // Message d'alerte en cas de succès de l'envoi de l'email
    });
}*/