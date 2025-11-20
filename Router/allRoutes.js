import Route from "./Route.js";

//Définir ici vos routes
export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html"),
    new Route("/menu", "Les Menus", "/pages/menu.html"),
    new Route("/mentions", "Mentions Légales", "/pages/mentions.html"),
    new Route("/cgv", "CGV", "/pages/cgv.html"),
    new Route("/signin", "Connexion", "/pages/signin.html"),
    new Route("/signup", "Inscription", "/pages/signup.html"),
    new Route("/contact", "Contact", "/pages/contact.html"),

];
    

//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "Vite & Gourmand";