const form = document.getElementById('contactForm');

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validation Bootstrap
    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    // Récupérer les données du formulaire
    const formData = {
        nom: document.getElementById('Nom').value,
        email: document.getElementById('email').value,
        sujet: document.getElementById('sujet').value,
        message: document.getElementById('message').value
    };

    try {
        const response = await fetch(apiUrl + 'contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
             const successDiv = document.createElement('div');
            successDiv.className = 'alert alert-success mt-3';
            successDiv.innerHTML = `
                <h5 class="alert-heading">Message envoyé avec succès !</h5>
                <p class="mb-0">Merci pour votre message. Nous vous répondrons dans les plus brefs délais.</p>
            `;
            form.parentElement.insertBefore(successDiv, form);
            
            // Réinitialiser le formulaire
            form.reset();
            form.classList.remove('was-validated');

            // Masquer le message après 5 secondes
            setTimeout(() => successDiv.remove(), 5000);
        } else {
            alert('Erreur lors de l\'envoi du message');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'envoi du message');
    }
});