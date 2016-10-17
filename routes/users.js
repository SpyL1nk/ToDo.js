const router = require('express').Router()
const sqlite = require('sqlite')

/* Users : POST */
router.post('/', (req, res, next) => {
	console.log(`- Route => Add User (POST)`)
    /* TODO: Verify all var are given before inserting into DB */
	sqlite.run('INSERT INTO users (pseudonyme, email, firstname, lastname, createdAt, updatedAt) VALUES (?,?,?,?,?,?)', req.body.pseudonyme, req.body.email, req.body.firstname, req.body.lastname, new Date().getTime(), new Date().getTime())
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
            json: () => {
                res.set(`Content-Type`, 'application/json')
                res.send({
                    status: 'error',
                    data: null,
                    messae: err
                })
            }
        })
	})
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
	}).catch((err) => {
        res.format({
            html: () => { next(err) },
            json: () => {
                res.set(`Content-Type`, 'application/json')
                res.send({
                    status: 'error',
                    data: null,
                    messae: err
                })
            }
        })
	})
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
	}).catch((err) => {
        res.format({
            html: () => { next(err) },
            json: () => {
                res.set(`Content-Type`, 'application/json')
                res.send({
                    status: 'error',
                    data: null,
                    messae: err
                })
            }
        })
	})
})

/* Users : Edit user by id route */
router.get('/:id/edit', (req, res, next) => {
	console.log(`- Route => Edit user by id`)
	sqlite.get('SELECT * FROM users WHERE id = ?', req.params.id)
	.then((result) => {
        res.format({
            html: () => {
                res.render('users/edit', {
                    title: 'Édition de l\'utilisateur n°' + result.id ,
                    path: '/users/' + result.id + '?_method=PUT',
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
	}).catch((err) => {
        res.format({
            html: () => { next(err) },
            json: () => {
                res.set(`Content-Type`, 'application/json')
                res.send({
                    status: 'error',
                    data: null,
                    messae: err
                })
            }
        })
	})
})

/* Users : Delete user by id route */
router.delete(`/users/:id`, (req, res, next) => {
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
	}).catch((err) => {
        res.format({
            html: () => { next(err) },
            json: () => {
                res.set(`Content-Type`, 'application/json')
                res.send({
                    status: 'error',
                    data: null,
                    messae: err
                })
            }
        })
	})
})

/* Users : Update user by id route */
router.put('/:id', (req, res, next) => {
	console.log(`- Route => Update User by id`)
	sqlite.run('UPDATE users SET pseudonyme = ?, email = ?, firstname = ?, lastname = ?, updatedAt = ? WHERE id = ?', req.body.pseudonyme, req.body.mail, req.body.firstname, req.body.lastname, new Date().getTime(), req.params.id)
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
            html: () => { next(err) },
            json: () => {
                res.set(`Content-Type`, 'application/json')
                res.send({
                    status: 'error',
                    data: null,
                    messae: err
                })
            }
        })
	})
})

module.exports = router