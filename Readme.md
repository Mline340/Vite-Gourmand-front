# Vite & Gourmand 
Site vitrine 

# Présentation du projet

Pour la réalisation de l'ECF Studi, j'ai réalisé un site web de commande de menus en ligne avec livraison à domicile.

L'entreprise "Vite & Gourmand", installée à Bordeaux depuis plus de 25 ans, souhaite se moderniser et augmenter sa visibilité en proposant ses services de manière plus simple et dynamique via une plateforme web. L'objectif est de permettre aux clients de consulter les menus et de passer commande, ce qui facilitera la gestion des commandes et des livrasions ainsi qu'une image plus moderne de l'entreprise. 

# Architecture du projet 

J'ai séparé le front-end (HTML/CSS/JS) du back-end (Symfony) avec une API REST comme interface de communication. Cette architecture permet une meilleure maintenance et renforce la sécurité en isolant la logique métier et la base de données côté serveur.
Repository Front-end : Interface utilisateur (HTML/CSS/JS/Bootstrap)
Repository Back-end : API REST Symfony + base de données

# Technologies utilisées 

## Front-end 
- HTML 5 / CSS3 / JavaScript
- Bootstrap 5 + Bootstrap Icons
- Chart.js (graphiques) 

## Back-end 
- PHP 8.2.12
- Symfony 7.4.2
- Doctrine ORM
- MySQL
- Apache 2
- API Platform 4 
- Security Bundle 
- CROS (nelmio/cros-bundle)

## Installation base de données 
- MySQL (Adminer)
- MongoDB (données statistiques)

## Outils de développement 
- Visual Studio Code :
    -Extension front-end  : PHP server + Live SASS Compiler + intelephernse
    -Extension back-end : PHP et Symfony
- Git / Github
- XAMPP
- Symfony CLI
- Composer (API- zircote/swagger-php - orm-fixtures)
- npm

# Installation de l'environnement de développement 

## Prérequis
- VSCode : Editeur de texte léger avec extensions pour PHP et Symfony.

- PHP 8.2.12 : Langage de programmation pour le développement web.

- XAMPP  : Package incluant Apache, MySQL et PHP. Simplifie l'installation et la configuration de l'environnement local sans avoir à installer chaque composant séparément. 

- Git/ Github : Contrôle de version pour suivre les modifications et sauvegarde du code.

- Node.js et npm : Gestionnaire de paquets JavaScript pour installer les dépendances front-end.

- Composer : Gestionnaire de dépendances PHP indispensable pour installer les bundles Symfony (Doctrine, Sécurity, API Platform...).

- Symfony CLI : Outil officiel Symfony pour créer des projets, gérer les dépendances et lancer le serveur de développement. Facilite le workflow quotidien.


# Installation des outils de base sur Windows

**Télécharger et installer :**

-PHP : https://www.php.net/
-XAMPP 3.3.0 : https://www.apachefriends.org
-Git : https://git-scm.com/install/windows
-Node.js : https://nodejs.org/fr/download
-npm en ligne de commande npm install -g npm
-Composer : https://getcomposer.org/download/
-Symfony CLI : https://symfony.com/download

# Création et connexion des repositories Github 

**Méthode** 

-Création des dossiers projet sur mon ordinateur (Vite-Gourmand-front et vite_gourmand_back)
-Ouvrir chaque dossier avec Visual Studio Code :
    -Se rendre sur l'onglet Contrôle de code source
    -Sélectionner : Publish to Github
    -Choisir  : Public 
    -Puis valider 
-VS Code gère automatiquement : 
    -L'initialisation Git 
    -La création du repository sur Github
    -La connexion entre le projet local et Github
    -Le premier commit et push 

# Installation du projet côté Back-end

## Installation des dépendances :

composer install
Doctrine ORM-pack 
Sécurité : composer require symfony/security-bundle
API Pltaform : composer require api-platform/core
composer require zircote/swagger-php
Fictures : composer require --dev orm-fixtures
CROS : composer require nelmio/cors-bundle
voir le fichier : config/packages/nelmio_cors.yaml

## Configuration de la base de données : 

création du ficher .env.local 
   DATABASE_URL="mysql://root:*******@127.0.0.1:3306/bdd?serverVersion=10.4.32-MariaDB&charset=utf8mb4"

Création de la base de données : 
    php bin/console doctrine:database:create

Exécuter les migrations 
    php bin/console doctrine:migrations:migrate

## Lancement du serveur : 
Démarer le serveur Symfony : 
    symfony server:start 
    http://localhost:8000

# Installations du projet côté Front-end 

Installer les dépendances : npm install

Ouvrir l'application : PHP Server
    http://localhost:3000






## Sécurité et conformité RGPD

### Sécurité des données
- Mots de passe hachés avec bcrypt via Symfony Security
- En production, HTTPS serait activé pour chiffrer les communications

### Validation des données
- **Email** : validation format (regex front + Assert\Email back)
- **Mot de passe** : validation longueur minimale et complexité
- **Formulaires** : validation en temps réel côté client (JavaScript) avant soumission
- **Données obligatoires** : vérification côté serveur (Assert\NotBlank)
- Protection contre les injections via le système ORM de Symfony

### Principe de minimisation (RGPD)
- Collecte limitée au strict nécessaire
- Pas de données sensibles superflues (pas de date de naissance, situation familiale, etc.)

### Droits utilisateurs
- Droit à l'effacement : suppression du compte utilisateur possible
- Gestion des employés : possibilité de désactiver les comptes employés (champ `actif`)