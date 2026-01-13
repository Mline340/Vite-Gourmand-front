import Route from "./Route.js";
import { allRoutes, websiteName } from "./allRoutes.js";

// Création d'une route pour la page 404 (page introuvable)
const route404 = new Route("404", "Page introuvable", "/pages/404.html", []);

// Fonction pour récupérer la route correspondant à une URL donnée
const getRouteByUrl = (url) => {
  let currentRoute = null;
  // Parcours de toutes les routes pour trouver la correspondance
  allRoutes.forEach((element) => {
    if (element.url == url) {
      currentRoute = element;
    }
  });
  // Si aucune correspondance n'est trouvée, on retourne la route 404
  if (currentRoute != null) {
    return currentRoute;
  } else {
    return route404;
  }
};

// Fonction pour charger le contenu de la page
const LoadContentPage = async () => {
  const path = window.location.pathname;
  // Récupération de l'URL actuelle
  const actualRoute = getRouteByUrl(path);

  // Vérifier les droits d'accès à la page
  const allRolesArray = actualRoute.authorize;
  if (allRolesArray.length > 0) {
    if (allRolesArray.includes("disconnected")) {
      if (isConnected()) {
        window.location.replace("/");
      }
    } else {
      const roleUser = getRole();
      
      // Si l'utilisateur n'est pas connecté ou n'a pas le bon rôle
      if (!roleUser || !allRolesArray.includes(roleUser)) {
        // Cas spécial pour la page de commande
        if (path === "/commande") {
          alert("Vous devez avoir créé un compte et être connecté pour accéder aux commandes");
          window.location.replace("/connexion");
          return;
        }
        // Pour les autres pages protégées
        window.location.replace("/");
        return;
      }
    }
  }
  
  // NETTOYER LES ANCIENS SCRIPTS DYNAMIQUES
  const oldScripts = document.querySelectorAll('script[data-dynamic-route]');
  oldScripts.forEach(script => script.remove());
  
  // Récupération du contenu HTML de la route
  const html = await fetch(actualRoute.pathHtml).then((data) => data.text());
  // Ajout du contenu HTML à l'élément avec l'ID "main-page"
  document.getElementById("main-page").innerHTML = html;

  // Ajout du contenu JavaScript
  if (actualRoute.pathJS != "") {
    // Création d'une balise script
    var scriptTag = document.createElement("script");
    scriptTag.setAttribute("type", "text/javascript");
    scriptTag.setAttribute("src", actualRoute.pathJS);
    scriptTag.setAttribute("data-dynamic-route", "true"); // Marqueur pour nettoyage
    
    // Attendre que le script soit chargé
    scriptTag.onload = function() {
      console.log("✅ Script chargé:", actualRoute.pathJS);
      
      // Appeler la fonction d'initialisation spécifique à la page si elle existe
      const pageName = actualRoute.pathJS.split('/').pop().replace('.js', '');
      const initFunctionName = `onPageLoaded${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`;
      
      if (typeof window[initFunctionName] === 'function') {
        console.log(`🎯 Appel de ${initFunctionName}()`);
        window[initFunctionName]();
      }
    };

    scriptTag.onerror = function() {
      console.error("❌ Erreur de chargement du script:", actualRoute.pathJS);
    };

    // Ajout de la balise script au corps du document
    document.querySelector("body").appendChild(scriptTag);
  }

  // Changement du titre de la page
  document.title = actualRoute.title + " - " + websiteName;

  // Afficher et masquer les éléments en fonction du rôle
  showAndHideElementsForRoles();
};

// Fonction pour gérer les événements de routage (clic sur les liens)
const routeEvent = (event) => {
  event = event || window.event;
  event.preventDefault();
  // Mise à jour de l'URL dans l'historique du navigateur
  window.history.pushState({}, "", event.target.href);
  // Chargement du contenu de la nouvelle page
  LoadContentPage();
};

// Gestion de l'événement de retour en arrière dans l'historique du navigateur
window.onpopstate = LoadContentPage;
// Assignation de la fonction routeEvent à la propriété route de la fenêtre
window.route = routeEvent;
// Chargement du contenu de la page au chargement initial
LoadContentPage();