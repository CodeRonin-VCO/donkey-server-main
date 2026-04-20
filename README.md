# Donkey - Social Network

Donkey est un réseau social moderne développé avec la stack MERN (MongoDB, Express, React, Node.js). Il propose des fonctionnalités sociales classiques comme l’authentification, la publication de posts, les commentaires, la gestion des utilisateurs et la messagerie instantanée.

## Technologies
Backend :

    Node.js

    Express.js

    MongoDB (via Mongoose)

Frontend :

    React (non inclus ici, à connecter séparément)

Temps réel :

    WebSockets (via socket.io)

## Dependancies
- nodemon
- morgan
- mongoose
- argon2 (hash)
- jsonwebtoken
- cors
- multer

## Structure du backend
/src
- Contient tous les fichiers de l'application
```
    /config
        - Connection DB
        - Injection de fausses données (json)
    /controllers
        - Authentification
        - Gestion des posts et commentaires
        - Gestion des utilisateurs
    /data
        - Fausses données json (user + posts)
    /middlewares
        - Authentification/autorisation
        - Gestion de l'upload des images et vidéos avec multer
    /models
        - Centralisation des schéma (index.js)
        - Schéma posts
        - Schéma users
    /routers
        - Centralisation des routes (index.js)
        - Routes authentification
        - Routes posts
        - Routes users
    /sockets
        - Gestion de la messagerie instantanée côté back
    /utils
        - Gestion du token (générer et décoder)
    /app
        - Centralisation de l'application
        - Middlewares globaux (morgan, cors, authentification, route, upload, connectDB, error, serveur)
```

## Dossiers d’upload

/uploads
- Contient les images envoyées en locales (imitation avec multer)
```
    /avatars
    /posts
    /banner
```
