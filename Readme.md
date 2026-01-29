# Vite & Gourmand 
Site vitrine 

# Installation Front
initialisation du projet 
front : Pour la création de mon projet j'ai utilisé : 
visual Studio Code comme éditeur de texte 
Publier sur GitHub : pour créer un reporitory sur Git hub et de faire un puch pour envoyer le dossier sur git hub premier commit de créer.
J'ai installé Git Basch 
installation de PHP
extention PHP Server extension de vs code 
instalation npm sur le pc 
installation de Bootstrap 
installation de Bootstrap icons
extention Live Sass Compiler extension de vs code 
Import Chart.js

# Installation Back 
Installation PHP 8.2.12
Installation Apache2
Installation MySQL
Installation Xampp
installation symfony CLI
intallation Doctrine ORM-pack 
Installation security-bundle 
Installation composer require api
Installation composer require zircote/swagger-php
Installation composer require --dev orm-fixtures



# Installation base de données 
Adminer SQL
MongoDB Community Server

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