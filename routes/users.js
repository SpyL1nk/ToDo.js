const router = require('express').Router()
const User = require('../models/user')

/* Users : Get users list */
router.get('/', (req, res, next) => {
    console.log('- Route => List users')
    /* Get params or set them as default */
    let limit = parseInt(req.query.limit) || 20
    let offset = parseInt(req.query.offset) || 0
    
    if (limit < 1) limit = 1
    else if (limit > 100) limit = 100
    
    if (offset < 0) offset = 0
    
    Promise.all([
        User.getAll(limit, offset),
        User.count()
    ]).then((result) => {
        res.format({
            html: () => {
                res.render('users/index', {
                    title: 'Liste des utilisateurs',
                    users: result[0],
                    count: result[1],
                    limit: limit,
                    offset: offset
                })
            },
            json: () => {
                res.send({
                    data: result[0],
                    meta: {
                        count: result[1].count,
                        offset: offset,
                        limit: limit
                    }
                })
            }
        })
	}).catch(next)
})

/* Users : Edit user by id */
router.get('/:id(\\d+)/edit', (req, res, next) => {
	console.log('- Route => Edit user by id')
    res.format({
        html: () => {
            User.get(req.params.id).then((result) => {
                var sess = req.session
                res.render('users/edit', {
                    title: 'Édition de l\'utilisateur n°' + result.id ,
                    path: '/users/' + result.id + '?_method=PUT',
                    user: result,
                    flash: sess.flash
                })
                /* Don't forget to clean the flash of the session! */
                sess.flash = {}
            }).catch(next)
        },
        json: () => {
            let err = new Error('Bad Request')
            err.status = 400
            next(err)
        }
    })
})

/* Users : Add */
router.get('/add', (req, res, next) => {
	console.log('- Route => Add user (GET)')
    res.format({
        html: () => {
            var sess = req.session
            res.render('users/edit', {
                title: 'Ajout d\'un utilisateur',
                path: '/users',
                user: {},
                flash: sess.flash
            })
            /* Don't forget to clean the flash of the session! */
            sess.flash = {}
        },
        json: () => {
            let err = new Error('Bad Request')
            err.status = 400
            next(err)
        }
    })
})

/* Users : Get by id */
router.get('/:id(\\d+)', (req, res, next) => {
	console.log('- Route => Get user by id')
	User.get(req.params.id).then((result) => {
        if(!result) return next()
        
        res.format({
            html: () => {
                res.render('users/show', {
                    title: 'Informations de l\'utilisateur',
                    user: result
                })
            },
            json: () => {
                res.send({
                    status: 'success',
                    /* Security issue: send back password hash, we should disable it */
                    data: result,
                    message: null
                })
            }
        })
	}).catch(next)
})

/* Users : POST */
router.post('/', (req, res, next) => {
	console.log('- Route => Add user (POST)')
    /* Check forms to catch errors */    
    if(
        !req.body.pseudonyme || req.body.pseudonyme == '' ||
        !req.body.email || req.body.email == '' ||
        !req.body.firstname || req.body.firstname == '' ||
        !req.body.lastname || req.body.lastname == '' ||
        !req.body.password || req.body.password == '' ||
        !req.body.password_check || req.body.password_check == '' ||
        req.body.password != req.body.password_check ||
        (req.body.password.length > 0 && req.body.password.length < 8)
    ) {
        // TODO: Add email verification + password complexity (client side + server side)
        var errorList = []
        if(!req.body.pseudonyme || req.body.pseudonyme == '') { errorList.push('Vous n\'avez pas renseigné votre pseudonyme.') }
        if(!req.body.email || req.body.email == '') { errorList.push('Vous n\'avez pas renseigné votre adresse mél.') }
        if(!req.body.firstname || req.body.firstname == '') { errorList.push('Vous n\'avez pas renseigné votre prénom.') }
        if(!req.body.lastname || req.body.lastname == '') { errorList.push('Vous n\'avez pas renseigné votre nom.') }
        if(!req.body.password || req.body.password == '' || !req.body.password_check || req.body.password_check == '') { errorList.push('Vous n\avez pas renseigné de mot de passe.') }
        if(req.body.password != req.body.password_check) { errorList.push('Les deux mots de passe entrés sont différents.') }
        if(req.body.password.length > 0 && req.body.password.length < 8) { errorList.push('Votre mot de passe doit faire plus de 8 charactères.') }

        res.format({
            html: () => {
                /* Set error list into session of the client */
                var sess = req.session
                if(sess.flah && sess.flash.errorList) {
                    for (var msg in errorList) {
                      sess.flash.errorList.push(msg)
                    }
                } else if (sess.flash) {
                    sess.flash.errorList = errorList
                } else {
                    sess.flash = {'errorList': errorList}
                }
                
                res.redirect(301, '/users/add' )
            },
            json: () => {
                res.send({
                    status: 'error',
                    data: null,
                    message: errorList
                })
            }
        })
    } else {
        User.insert(req.body).then((result) => {
            res.format({
                html: () => { 
                    /* TODO: Add a session flash to alert user his modification is OK */
                    res.redirect(301, '/users')
                },
                json: () => {
                    res.send({
                        status: 'success',
                        /* Security issue: send back password hash, we should disable it */
                        data: result,
                        message: null
                    })
                }
            })
        }).catch(next)
    }
})

/* Users : Delete user by id route */
router.delete('/:id(\\d+)', (req, res, next) => {
	console.log('- Route => Delete user by id')
	User.remove(req.params.id).then((result) => {
        res.format({
            html: () => { 
                /* TODO: Add a session flash to alert user his modification is OK */
                res.redirect(301, '/users') },
            json: () => {
                res.set(`Content-Type`, 'application/json')
                res.send({
                    status: 'success',
                    data: result,
                    message: null
                })
            }
        })
	}).catch(next)
})

/* Users : Update user by id route */
router.put('/:id', (req, res, next) => {
	console.log(`- Route => Update User by id`)
    /* Check forms to catch errors */
    if(
        req.body.password != req.body.password_check ||
        (req.body.password.length > 0 && req.body.password.length < 8)
    ) {
        // TODO: Add email verification + password complexity (client side + server side)
        var errorList = []
        if(req.body.password != req.body.password_check) { errorList.push('Les deux mots de passe entrés sont différents.') }
        if(req.body.password.length > 0 && req.body.password.length < 8) { errorList.push('Votre mot de passe doit faire plus de 8 charactères.') }
        
        res.format({
            html: () => {
                /* Set error list into session of the client */
                var sess = req.session
                if(sess.flah && sess.flash.errorList) {
                    for (var msg in errorList) {
                      sess.flash.errorList.push(msg)
                    }
                } else if (sess.flash) {
                    sess.flash.errorList = errorList
                } else {
                    sess.flash = {'errorList': errorList}
                }
                
                res.redirect(301, '/users/' + req.params.id + '/edit' ) },
            json: () => {
                res.send({
                    status: 'error',
                    data: null,
                    message: errorList
                })
            }
        })
    } else {
        User.update(req.params.id, req.body).then((result) => {
            res.format({
                html: () => { 
                    /* TODO: Add a session flash to alert user his modification is OK */
                    res.redirect(301, '/users') },
                json: () => {
                    res.send({
                        status: 'success',
                        /* Security issue: send back password hash, we should disable it */
                        data: result,
                        message: null
                    })
                }
            })
        }).catch(next)
    }
})

module.exports = router