const router = require('express').Router()
const sqlite = require('sqlite')

/* Page d'accueil */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Mon super projet' })
})

module.exports = router
