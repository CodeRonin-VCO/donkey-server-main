# Donkey - Social Network

## Technologies
- Node.js
- Express.js

## Dependancies
- nodemon
- morgan
- mongoose
- argon2 (hash)
- jsonwebtoken
- cors
- multer

// todo: adapter cela
## Infos diverses
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


/uploads
- Contient les images envoyées en locales (imitation avec multer)
```
    /avatars
    /posts
    /banner
```

<!-- todo: -->
<!-- 2. Créer connections → un user + user/:userId pour voir le profil des autres -->
<!-- 3. Mettre en place un système de messagerie instantanée -->
<!-- 5. Faire une page de loading en cas de fallback -->


<!-- fixme: changer l'url des images ceperegra vers du local au cas ou pas de connexion internet -->