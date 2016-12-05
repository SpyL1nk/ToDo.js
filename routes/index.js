const router = require('express').Router()
const sqlite = require('sqlite')

/* Page d'accueil */
router.get('/', function(req, res, next) {
    var sess = req.session
    if(sess.accessToken) {
        console.log('accessToken:', sess.accessToken)
    } else {
        console.log('No accessToken set yet!')
    }
    
    res.render('index', { title: 'Mon super projet' })
})

module.exports = router
