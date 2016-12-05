const router = require('express').Router()
    , sqlite = require('sqlite')

/* Models imports */
const User = require('../models/user')
    , Session = require('../models/session')

/* Sessions: Authentication user page */
router.get('/', (req, res, next) => {
	console.log('- Route => Sessions (GET)')
    res.format({
        html: () => {
            res.render('sessions/index', {
                title: 'Authentification'
            })
        },
        json: () => {
            let err = new Error('Bad Request')
            err.status = 400
            next(err)
        }
    })
})

/* Sessions: POST route */
router.post('/', (req, res, next) => {
    console.log('- Route => Sessions (POST)')
    if (
        !req.body.pseudonyme || req.body.pseudonyme == '' ||
        !req.body.password || req.body.password == ''
    ) {
        let err = new Error('Bad Request')
        err.status = 400
        return next(err)
    }
    
    //On check si la session ou un cookie n'a pas déjà été créé
    
    
    User.checkAuth(req.body.pseudonyme, req.body.password).then((result) => {
        /* Return error no pseudonyme/password couple found */
        if(!result) return next()
        
        Session.get(result).then((session) => {
            
            if(!session) {
                /* No session found for this user, let's create a new one */
                Session.insert(result).then((session) => {
                    res.format({
                        html: () => {
                            var sess = req.session
                            sess.accessToken = session.accessToken
                            
                            res.redirect('/')
                        },
                        json: () => {
                            res.send({
                                accessToken: session.accessToken
                            })
                        }
                    })
                }).catch(next)
            } else {
                /* Session found! Send data if JSON, redirect to / if HTML */
                res.format({
                    html: () => {
                        var sess = req.session
                        sess.accessToken = session.accessToken
                        
                        res.redirect('/')
                    },
                    json: () => {
                        res.send({
                            accessToken: session.accessToken
                        })
                    }
                })
            }
        }).catch(next)
    }).catch(next)
})

module.exports = router