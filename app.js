// Dépendances native
const path = require('path')

// Dépendances 3rd party
const express = require('express')
    , bodyParser = require('body-parser')
    , sass = require('node-sass-middleware')
    , methodOverride = require('method-override')
    , session = require('express-session')
    , sqlite = require('sqlite')

// Constantes et initialisations
const PORT = process.PORT || 8080
    , app = express()

// Initialisation des sessions
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

// La liste des différents routeurs (dans l'ordre)
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))
app.use('/sessions', require('./routes/sessions'))

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

sqlite.open(`./express.sqlite`).then((result) => {
    console.log('DATABASE > Successfuly opened database')
 	return sqlite.run(
        'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, pseudonyme, email, password, firstname, lastname, createdAt, updatedAt)'
    )
}).then(() => {
    console.log('DATABASE > Table users created or already exists in database')
    
    return sqlite.run(
        'CREATE TABLE IF NOT EXISTS sessions (userId, accessToken, createdAt, expiresAt)'
    )
}).then(() => {
    console.log('DATABASE > Table sessions created or already exists in database')
    
    app.listen(PORT, () => {
        console.log('APPLICATION > Server started, listenning on port', PORT)
    })
}).catch((err) => {
    console.log('ERR >', err)
})