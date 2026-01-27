import Route from "./Route.js";

//Définir ici vos routes
export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html", [], "/js/home.js"),
    new Route("/menu", "Les Menus", "/pages/menu/menu.html", [], "/js/menu/menu.js"),
    new Route("/mentions", "Mentions Légales", "/pages/mentions.html", []),
    new Route("/cgv", "CGV", "/pages/cgv.html", []),
    new Route("/signin", "Connexion", "/pages/auth/signin.html", ["disconnected"],"/js/auth/signin.js"),
    new Route("/signup", "Inscription", "/pages/auth/signup.html", ["disconnected"], "/js/auth/signup.js"),
    new Route("/contact", "Contact", "/pages/auth/contact.html", [],"/js/auth/contact.js"),
    new Route("/account", "Mon compte", "/pages/auth/account.html", ["user", "admin", "employe"], "/js/auth/account.js" ),
    new Route("/information", "Mes Informations", "/pages/auth/information.html", ["user", "admin", "employe"], "/js/auth/information.js"),
    new Route("/employe", "Créer un employé", "/pages/auth/employe.html", ["admin"], "/js/auth/employe.js"),
    new Route("/createmenu", "Créer un menu", "/pages/menu/createmenu.html", ["admin", "employe"], "/js/menu/createmenu.js"),
    new Route("/descriptionmenu", "Détail d'un menu", "/pages/menu/descriptionmenu.html", [], "/js/menu/descriptionmenu.js"),
    new Route("/commande", "Commander un menu", "/pages/menu/commande.html", ["user", "employe", "admin"], "/js/menu/commande.js"),
    new Route("/modifier", "Modifier une commande", "/pages/commande/modifier.html", ["user", "employe", "admin"], "/js/commande/modifier.js"),
    new Route("/suivi", "Suivre une commande", "/pages/commande/suivi.html", ["user", "employe", "admin"], "/js/commande/suivi.js"),
    new Route("/avis", "Donner un avis", "/pages/avis/avis.html", ["user", "employe", "admin"], "/js/avis/avis.js"),
    new Route("/horaire", "Modifier les horaires", "/pages/auth/horaire.html", ["employe", "admin"], "/js/auth/horaire.js"),
    new Route("/mes-commandes", "Visualiser mes commandes", "/pages/commande/mes-commandes.html", ["user"], "/js/commande/mes-commandes.js"),
    new Route("/commandes-clients", "Visualiser les commandes clients", "/pages/commande/commandes-clients.html", ["employe", "admin"], "/js/commande/commandes-clients.js"),
    new Route("/gerer", "Gerer commande par employe et admin", "/pages/commande/gerer.html", ["employe", "admin"], "/js/commande/gerer.js"),
    new Route("/gerer-avis", "Gerer les avis par employe et admin", "/pages/avis/gerer-avis.html", ["employe", "admin"], "/js/avis/gerer-avis.js"),
    new Route("/mes-avis", "Visualiser tous les avis déposer", "/pages/avis/mes-avis.html", ["user"], "/js/avis/mes-avis.js"),
];
    

//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "Vite & Gourmand";