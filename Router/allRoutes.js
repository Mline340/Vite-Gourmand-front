import Route from "./Route.js";

//Définir ici vos routes
export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html", []),
    new Route("/menu", "Les Menus", "/pages/menu/menu.html", []),
    new Route("/mentions", "Mentions Légales", "/pages/mentions.html", []),
    new Route("/cgv", "CGV", "/pages/cgv.html", []),
    new Route("/signin", "Connexion", "/pages/auth/signin.html", ["disconnected"],"/js/auth/signin.js"),
    new Route("/signup", "Inscription", "/pages/auth/signup.html", ["disconnected"], "/js/auth/signup.js"),
    new Route("/contact", "Contact", "/pages/auth/contact.html", [],"/js/auth/contact.js"),
    new Route("/account", "Mon compte", "/pages/auth/account.html", ["user","admin","employe"] ),
    new Route("/menu1", "Menu 1", "/pages/menu/menu1.html", []),
];
    

//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "Vite & Gourmand";