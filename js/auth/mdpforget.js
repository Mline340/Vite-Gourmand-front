document.getElementById('btnEnvoyer').addEventListener('click', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('Emailforget').value.trim();
    const emailInput = document.getElementById('Emailforget');
    
    // Réinitialiser les erreurs
    emailInput.classList.remove('is-invalid');
    
    // Validation basique
    if (!email) {
        emailInput.classList.add('is-invalid');
        emailInput.nextElementSibling.textContent = 'Veuillez saisir votre email';
        return;
    }
    
    try {
        const response = await fetch(`${apiUrl}password/forgot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });
        
        if (response.ok) {
            alert('Un email de réinitialisation a été envoyé à votre adresse.');
            
        } else {
            const error = await response.json();
            emailInput.classList.add('is-invalid');
            emailInput.nextElementSibling.textContent = error.message || 'Email introuvable';
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
    }
});