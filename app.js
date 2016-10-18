// Dépendances native
const path = require('path')

// Dépendances 3rd party
const express = require('express')
const bodyParser = require('body-parser')
const sass = require('node-sass-middleware')
const methodOverride = require('method-override')
const session = require('express-session')

// Constantes et initialisations
const PORT = process.PORT || 8080
const app = express()

// Initialisation des sessions
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'TD T0D0 L15T',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
const sqlite = require('sqlite')



// Mise en place des vues
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware pour parser le body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

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
app.use('/users', require('./routes/sessions'))

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
 	return sqlite.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, pseudonyme, email, password, firstname, lastname, createdAt, updatedAt)`)
}).then(() => {
    console.log('DATABASE > Tables created or already exists in database')
    
    app.listen(PORT, () => {
        console.log('APPLICATION > Server started, listenning on port', PORT)
    })
})