// Dépendances native
const path = require('path')

// Dépendances 3rd party
const express = require('express')
    , bodyParser = require('body-parser')
    , sass = require('node-sass-middleware')
    , methodOverride = require('method-override')
    , session = require('express-session')
    , sqlite = require('sqlite')
    
// Models importation
const Session = require('./models/session')

// Constantes et initialisations
const PORT = process.PORT || 8080
    , app = express()

// Initialisation des sessions
// TODO: Generate random secret seed for sessions
app.set('trust proxy', 1)
app.use(session({
  secret: 'TD T0D0 L15T',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

// Mise en place des vues
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware pour parser le body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Method override
app.use(methodOverride('_method', {methods: ['GET', 'POST']}))

// Préprocesseur sur les fichiers scss -> css
app.use(sass({
  src: path.join(__dirname, 'styles'),
  dest: path.join(__dirname, 'assets', 'css'),
  prefix: '/css',
  outputStyle: 'expanded'
}))

// On sert les fichiers statiques
app.use(express.static(path.join(__dirname, 'assets')))

// Vérification de la connexion
app.use((req, res, next) => {
    // Si le client veut afficher la page sessions, aucune vérification à faire
    if(req.url == '/sessions') {
        next()
    } else {
        // Sinon on vérifie que le client est bien connecté
        if(req.session.accessToken || req.headers['x-accesstoken']) {
            var accessToken = (req.session.accessToken || req.headers['x-accesstoken'])
            
            // T0D0: Add informations about the client (IP Address, User Agent) to avoid session hijacking
            if(Session.checkAuth(accessToken)) {
                // La session du client est valide, il peut accéder à la ressource
                next()
            } else {
                res.format({
                    html: () => {
                        res.redirect('/sessions')
                    },
                    json: () => {
                        let err = new Error('You need to be authenticate to access this resource.')
                        err.status = 400
                        next(err)
                    }
                })
            }
        } else {
            // T0D0: Add Cookies auth' for persistence
            res.format({
                html: () => {
                    res.redirect('/sessions')
                },
                json: () => {
                    let err = new Error('You need to be authenticate to access this resource.')
                    err.status = 400
                    next(err)
                }
            })
        }
    }
})

// La liste des différents routeurs
app.use('/', require('./routes/index'))
app.use('/sessions', require('./routes/sessions'))
//app.use('/teams', require('./routes/teams'))
app.use('/todos', require('./routes/todos'))
app.use('/users', require('./routes/users'))

// Erreur 404
app.use(function(req, res, next) {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

// Gestion des erreurs
// Notez les 4 arguments !!
app.use(function(err, req, res, next) {
  // Les données de l'erreur
  let data = {
    message: err.message,
    status: err.status || 500
  }

  // En mode développement, on peut afficher les détails de l'erreur
  if (app.get('env') === 'development') {
    data.error = err.stack
  }

  // On set le status de la réponse
  res.status(data.status)

  // Réponse multi-format
  res.format({
    html: () => { res.render('error', data) },
    json: () => { res.send(data) }
  })
})

sqlite.open(`./todo-js.sqlite`).then((result) => {
    console.log('DATABASE > Successfuly opened database')
 	return sqlite.run(
        'CREATE TABLE IF NOT EXISTS users (id, pseudonyme, email, password, firstname, lastname, createdAt, updatedAt, teamId)'
    )
}).then(() => {
    console.log('DATABASE > Table users created or already exists in database')
    
    return sqlite.run(
        'CREATE TABLE IF NOT EXISTS sessions (userId, accessToken, createdAt, expiresAt)'
    )
}).then(() => {
    console.log('DATABASE > Table sessions created or already exists in database')

    return sqlite.run(
        'CREATE TABLE IF NOT EXISTS todos (id, userId, teamId, title, desc, createdAt, updatedAt, completedAt, assignedTo)'
    )
}).then(() => {
    console.log('DATABASE > Table todos created or already exists in database')

    return sqlite.run(
        'CREATE TABLE IF NOT EXISTS teams (id, name, ownerId, desc, createdAt, updatedAt)'
    )
}).then(() => {
    console.log('DATABASE > Table teams created or already exists in database')
    
    app.listen(PORT, () => {
        console.log('APPLICATION > Server started, listenning on port', PORT)
    })
}).catch((err) => {
    console.log('ERR >', err)
})