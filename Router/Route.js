export default class Route {
    constructor(url, title, pathHtml, pathJS = "") {
      this.url = url;
      this.title = title;
      this.pathHtml = pathHtml;
      this.pathJS = pathJS;
      this.authorize = authorize;
    }
}

/*
[] -> Tout le monde peut y accéder
["disconnected"] -> Réserver aux utilisateurs déconnecté 
["user"] -> Réserver aux utilisateurs avec le rôle user 
["admin"] -> Réserver aux utilisateurs avec le rôle admin 
["admin", "employe"] -> Réserver aux utilisateurs avec le rôle emplye OU admin
*/