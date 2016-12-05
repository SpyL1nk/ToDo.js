#ToDO.js - API de gestion de tâches simple - WIP (10%)

Petite API REST avec interface Web pour la gestion de tâches simples seuls ou en équipe.

## Installation

    git clone https://github.com/SpyL1nk/ToDo.js.git
    cd ToDo.js
    npm install

## Utilisation

    npm start
    
    Adresse: localhost:8080
    
    Accès lors de l'installation: administrator / 4Z3rTyU10p (pensez à changer le mot de passe lors de la première connexion).
    
## API
    
    GET /users --> affiche la liste des utilisateurs
    GET /users/:id --> affiche les informations d'un utilisateur en particulier
    POST /users --> Ajoute un nouvel utilisateur dans la base de données, paramètres:
            - pseudonyme: pseudonyme
            - email: email
            - firstnam: prénom
            - lastname: nom
            - password: mot de passe (au moins 8 charactères)
            - password_check: vérification du mot de passe
    DELETE /users/:id --> Supprime l'utilisateur
    PUT /users/:id --> Met à jour l'utilisateur avec les informations renseignées (indentiques au POST /users).
    
    GET /todos --> Affiche la liste des tâches qui vous appartiennent ou appartiennent à votre équipe
    GET /todos/:id --> Affiches les informations d'une tâche en particulier
    POST /add --> Ajouter une nouvelle tâche dans la base de données, paramètres:
            - title: titre
            - teamId: UUID de l'équipe (tâche personnel si nul)
            - desc: description
            - assignement: UUID de l'utilisateur a qui est assigné la tâche
    PUT /todos/:id --> Met à jour la tâche avec les informations renseignées (indentiques au POST /add + completion (true / false) qui renseigne la validation de la tâche
    DELETE /todos/:id --> Supprime la tâche
    
    POST /sessions --> Renvoie l'accessToken à utiliser lors des échange en JSON, paramètres:
            - pseudonyme: pseudonyme
            - password: mot de passe
    L'intégralité de l'API requiert une authentification avec un token fourni sur la route /sessions.
    Vous devrez le renseigner dans le headers x-accesstoken de toutes vos requêtes.
    Ce token est valable 12h, passé ce délai, vous devrez en redemander un nouveau.
    