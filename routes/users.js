const router = require('express').Router()
    , sqlite = require('sqlite')
    , bcrypt = require('bcrypt-nodejs')


/* Users : POST */
router.post('/', (req, res, next) => {
	console.log(`- Route => Add User (POST)`)
    /* Check forms to catch errors */
    if(req.body.pseudonyme && req.body.email && req.body.firstname && req.body.lastname && req.body.password == req.body.password_check && ((req.body.password.length > 0 && req.body.password.length < 8) || req.body.password.length == 0 )) {
    	sqlite.run('INSERT INTO users (pseudonyme, email, password, firstname, lastname, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?)', req.body.pseudonyme, req.body.email, bcrypt.hashSync(req.body.password), req.body.firstname, req.body.lastname, new Date().getTime(), new Date().getTime())
        .then((result) => {
            res.format({
                html: () => { res.redirect(301, '/users') },
                json: () => {
                    res.set(`Content-Type`, 'application/json')
                    res.send({
                        status: 'success',
                        data: result,
                        message: null
                    })
                }
            })
        }).catch((err) => {
            res.format({
                html: () => { res.redirect(301, '/users') },
                json: () => { next }
            })
        })
    } else {
        res.format({
            html: () => {
                // TODO: Add email verification + password complexity (cliet side + server side)
                var errorList = []
                if(!req.body.pseudonyme) { errorList.push('Vous n\'avez pas renseigné votre pseudonyme.') }
                if(!req.body.email) { errorList.push('Vous n\'avez pas renseigné votre adresse mél.') }
                if(!req.body.firstname) { errorList.push('Vous n\'avez pas renseigné votre prénom.') }
                if(!req.body.lastname) { errorList.push('Vous n\'avez pas renseigné votre nom.') }
                if(req.body.password != req.body.password_check) { errorList.push('Les deux mots de passe entrés sont différents.') }
                if(req.body.password.length > 0 && req.body.password.length < 8) { errorList.push('Votre mot de passe doit faire plus de 8 charactères!') }
                /* Set error list into session of the client */
                var sess = req.session
                if(sess.errorList) {
                    for (var msg in errorList) {
                      sess.errorList.push(msg)
                    }
                } else {
                    sess.errorList = errorList
                }
                res.redirect(301, '/users/' + req.params.id + '/edit' ) },
            json: () => {
                res.set(`Content-Type`, 'application/json')
                res.send({
                    status: 'error',
                    data: null,
                    message: ''
                })
            }
        })
    }
})

/* Users : Add route */
router.get('/add', (req, res, next) => {
	console.log(`- Route => Add User (GET)`)
    res.format({
        html: () => {
            res.render('users/edit', {
                title: 'Ajout d\'un utilisateur',
                path: '/users?_method=POST',
                user: {id: '', pseudonyme: '', email: '', firstname: '', lastname: ''}
            }) 
        },
        json: () => {
            res.set(`Content-Type`, 'application/json')
            res.send({
                status: 'success',
                data: result,
                message: null
            })
        }
    })
})

/* Users : Get by id route */
router.get('/:id', (req, res, next) => {
	console.log(`- Route => Get User by id`)
	sqlite.get('SELECT * FROM users WHERE id = ?', req.params.id)
	.then((result) => {
            res.format({
                html: () => {
                    res.render('users/show', {
                        title: 'Informations de l\'utilisateur',
                        user: result
                    })
                },
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

/* Users : Get users list route */
router.get('/', (req, res, next) => {
	console.log(`- Route => Get Users`)
	sqlite.all(`SELECT * FROM users`)
	.then((result) => {
        res.format({
            html: () => {
                res.render('users/index', {
                    title: 'Liste des utilisateurs',
                    users: result,
                }) 
            },
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

/* Users : Edit user by id route */
router.get('/:id/edit', (req, res, next) => {
	console.log(`- Route => Edit user by id`)
	sqlite.get('SELECT * FROM users WHERE id = ?', req.params.id)
	.then((result) => {
        res.format({
            html: () => {
                var sess = req.session
                var errorList = []
                if(sess.errorList) { 
                    errorList = sess.errorList
                    sess.errorList = []
                }
                res.render('users/edit', {
                    title: 'Édition de l\'utilisateur n°' + result.id ,
                    path: '/users/' + result.id + '?_method=PUT',
                    user: result,
                    errorList: errorList
                })
            },
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

/* Users : Delete user by id route */
router.delete('/:id', (req, res, next) => {
	console.log(`- Route => Delete User by id`)
	sqlite.all('DELETE FROM users WHERE id = ?', req.params.id)
	.then((result) => {
        res.format({
            html: () => { res.redirect(301, '/users') },
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
    if(req.body.pseudonyme && req.body.email && req.body.firstname && req.body.lastname && req.body.password == req.body.password_check && ((req.body.password.length > 0 && req.body.password.length < 8) || req.body.password.length == 0 )) {
        sqlite.run('UPDATE users SET pseudonyme = ?, email = ?, password = ?, firstname = ?, lastname = ?, updatedAt = ? WHERE id = ?', req.body.pseudonyme, req.body.email, bcrypt.hashSync(req.body.password), req.body.firstname, req.body.lastname, new Date().getTime(), req.params.id)
        .then((result) => {
            res.format({
                html: () => { res.redirect(301, '/users') },
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
    } else {
        res.format({
            html: () => {
                // TODO: Add email verification + password complexity (cliet side + server side)
                var errorList = []
                if(!req.body.pseudonyme) { errorList.push('Vous n\'avez pas renseigné votre pseudonyme.') }
                if(!req.body.email) { errorList.push('Vous n\'avez pas renseigné votre adresse mél.') }
                if(!req.body.firstname) { errorList.push('Vous n\'avez pas renseigné votre prénom.') }
                if(!req.body.lastname) { errorList.push('Vous n\'avez pas renseigné votre nom.') }
                if(req.body.password != req.body.password_check) { errorList.push('Les deux mots de passe entrés sont différents.') }
                if(req.body.password.length > 0 && req.body.password.length < 8) { errorList.push('Votre mot de passe doit faire plus de 8 charactères!') }
                /* Set error list into session of the client */
                var sess = req.session
                if(sess.errorList) {
                    for (var msg in errorList) {
                        sess.errorList.push(msg)
                    }
                } else {
                    sess.errorList = errorList
                }
                res.redirect(301, '/users/' + req.params.id + '/edit' ) },
            json: () => {
                res.set(`Content-Type`, 'application/json')
                res.send({
                    status: 'error',
                    data: null,
                    message: ''
                })
            }
        })
    }
})

module.exports = router