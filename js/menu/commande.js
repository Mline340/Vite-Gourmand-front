// Dans commande.js
document.addEventListener('DOMContentLoaded', function() {
    // Récupérer l'ID du menu depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const menuId = urlParams.get('id');
    
    console.log('Menu ID:', menuId);
    
    if (menuId) {
        // Charger les détails du menu pour la commande
        chargerMenuPourCommande(menuId);
    } else {
        console.error('Aucun ID de menu fourni');
        // Rediriger vers la page d'accueil ou afficher un message d'erreur
    }
});

async function chargerMenuPourCommande(menuId) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/menus/${menuId}`);
        const menu = await response.json();
        
        console.log('Menu pour commande:', menu);
        
        // Afficher les informations du menu dans votre formulaire de commande
        // ...
    } catch (error) {
        console.error('Erreur lors du chargement du menu:', error);
    }
}