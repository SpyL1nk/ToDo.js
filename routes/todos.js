const router = require('express').Router()

const Session = require('../models/session')
    , Todos = require('../models/todos')
    , User = require('../models/user')
    , Team = require('../models/team')
    
/*
function todos(offset, limit, count, todoList) {
    return new Promise((resolve, reject) => {
        var todos = []
        
        if(offset > count) offset = 0
        
        for(var i = 0; i < limit; i++) {
            if(offset + i >= count) {
                i = limit
            } else {
                console.log('count: ' + count + '; limit: ' + limit)
                var params = {'id': todoList[offset + i].id,
                    'userId': todoList[offset + i].userId,
                    'teamId': todoList[offset + i].teamId,
                    'title': todoList[offset + i].title,
                    'desc': todoList[offset + i].desc,
                    'createdAt': todoList[offset + i].createdAt,
                    'updatedAt': todoList[offset + i].updatedAt,
                    'completedAt': todoList[offset + i].completedAt,
                    'assignedTo': todoList[offset + i].assignedTo
                }
                
                Promise.all([
                    User.getName(todoList[offset + i].userId),
                    Team.getName(todoList[offset + i].teamId),
                    User.getName(todoList[offset + i].assignedTo) 
                ]).then((names) => {
                    if(names[0]) params.pseudonyme = names[0].pseudonyme
                    if(names[1]) params.teamName = names[1].pseudonyme
                    if(names[2]) params.assignedToName = names[2].pseudonyme

                    todos.push(params)
                })
            }
        }
        resolve(todos)
    })
}
*/

/* Todos : Get todos list of a user */
router.get('/', (req, res, next) => {
    console.log('- Route => List todos for an user')
    /* Get params or set them as default */
    var limit = parseInt(req.query.limit) || 20
    var offset = parseInt(req.query.offset) || 0
    
    if (limit < 1) limit = 1
    else if (limit > 100) limit = 100
    
    if (offset < 0) offset = 0

    var accessToken = (req.session.accessToken || req.headers['x-accesstoken'])
    
    Session.getUserId(accessToken).then((userId) => {
        Promise.all([
            Todos.getByUserId(userId.userId),
            Todos.countByUser(userId.userId)
        ]).then((result) => {
            res.format({
                html: () => {
                    res.render('todos/index', {
                        title: 'Liste des Todos',
                        todos: result[0],
                        count: result[1].count,
                        limit: limit,
                        offset: offset
                    })
                },
                json: () => {
                    res.send({
                        data: todos,
                        meta: {
                            count: result[1].count,
                            offset: offset,
                            limit: limit
                        }
                    })
                }
            })
        })
    }).catch(next)
})

/* Todos : Add form */
router.get('/add', (req, res, next) => {
	console.log('- Route => Todo add form')
    
    var accessToken = (req.session.accessToken || req.headers['x-accesstoken'])
    
    Session.getUserId(accessToken).then((userId) => {
        User.getTeamId(userId.userId).then((teamId) => {
            var teamList = []

            if(!teamId || teamId.teamId == null) {
                teamList = [{'id': 0, 'name': 'Personnel'}]
            } else {
                teamList = [{'id': 0, 'name': 'Personnel'},
                    {'id': teamId.teamId, 'name': Team.getName(teamId.teamId)}]
            }
            
            res.format({
                html: () => {
                    var sess = req.session
                    /* T0D0: Add title / desc history if POST request failed */
                    res.render('todos/edit', {
                        title: 'Formulaire d\'ajout d\'une tâche',
                        path: '/todos/add',
                        task: {},
                        teamList: teamList,
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
    }).catch(next)
})

/* Todos : Edit a task by id */
router.get('/:id/edit', (req, res, next) => {
    console.log('- Route => Edit a specific task')
    
    Todos.getById(req.params.id).then((task) => {
        if(!task) {
            /* No task found with this id */
            var errorList = []
            errorList.push('Aucune tâche n\'a été trouvée avec cet identifiant.')
            
            res.format({
                html: () => { 
                    /* TODO: Add a session flash to alert user this task can't be found */
                    res.redirect('/todos') },
                json: () => {
                    let err = new Error('Bad Request')
                    err.status = 400
                    next(err)
                }
            })   
        }
        
        var accessToken = (req.session.accessToken || req.headers['x-accesstoken'])
        
        Session.getUserId(accessToken).then((userId) => {
            if(task.userId = userId.userId || (task.teamId != '' && Team.userInTeam(userId.userId, task.teamId))) {
                User.getTeamId(userId.userId).then((teamId) => {
                    var teamList = []

                    if(!teamId || teamId.teamId == null) {
                        teamList = [{'id': 0, 'name': 'Personnel'}]
                    } else {
                        teamList = [{'id': 0, 'name': 'Personnel'},
                            {'id': teamId.teamId, 'name': Team.getName(teamId.teamId)}]
                    }
                    
                    res.format({
                        html: () => {
                            var sess = req.session
                            res.render('todos/edit', {
                                title: 'Modification de la tâche : ' + task.title,
                                task: task,
                                path: '/todos/' + task.id + '?_method=PUT',
                                flash: sess.flash,
                                teamList: teamList
                            })
                        },
                        json: () => {
                            let err = new Error('Bad Request')
                            err.status = 400
                            next(err)
                        }
                    })
                })
            } else {
                /* No rights on this task */
                var errorList = []
                errorList.push('Vous n\'avez pas les droits nécessaires pour afficher cette tâche.')
                
                res.format({
                    html: () => { 
                        /* TODO: Add a session flash to alert user he doesn't have right to delete this task */
                        res.redirect('/todos') },
                    json: () => {
                        let err = new Error('Bad Request')
                        err.status = 400
                        next(err)
                    }
                })  
            }
        })
    }).catch(next)
})


/* Todos : Get a task by id */
router.get('/:id', (req, res, next) => {
    console.log('- Route => Get specific task')
    
    Todos.getById(req.params.id).then((task) => {
        if(!task) {
            /* No task found with this id */
            var errorList = []
            errorList.push('Aucune tâche n\'a été trouvée avec cet identifiant.')
            
            res.format({
                html: () => { 
                    /* TODO: Add a session flash to alert user this task can't be found */
                    res.redirect('/todos') },
                json: () => {
                    res.send({
                        status: 'error',
                        data: null,
                        message: errorList
                    })
                }
            })   
        }
        
        var accessToken = (req.session.accessToken || req.headers['x-accesstoken'])
        
        Session.getUserId(accessToken).then((userId) => {
            if(task.userId = userId.userId || (task.teamId != '' && Team.userInTeam(userId.userId, task.teamId))) {
                res.format({
                    html: () => {
                        res.render('todos/show', {
                            title: 'Détails de la tâche ' + task.title,
                            todos: task
                        })
                    },
                    json: () => {
                        res.send({
                            data: task
                        })
                    }
                })
            } else {
                /* No rights on this task */
                var errorList = []
                errorList.push('Vous n\'avez pas les droits nécessaires pour afficher cette tâche.')
                
                res.format({
                    html: () => { 
                        /* TODO: Add a session flash to alert user he doesn't have right to delete this task */
                        res.redirect('/todos') },
                    json: () => {
                        res.send({
                            status: 'error',
                            data: null,
                            message: errorList
                        })
                    }
                })  
            }
        })
    }).catch(next)
})

router.post('/add', (req, res, next) => {
    console.log('- Route => Add todo (POST)')
    
    if(!req.body.title || req.body.title == '') {
        var errorList = []
        errorList.push('Vous n\'avez pas renseigné de titre pour créer la tâche.')
        
        res.format({
            html: () => {
                /* Set error list into session of the client */
                var sess = req.session
                if(sess.flah && sess.flash.errorList) {
                    for (var msg in errorList) {
                      sess.flash.errorList.push(msg)
                    }
                } else if(sess.flash) {
                    sess.flash.errorList = errorList
                } else {
                    sess.flash = {'errorList': errorList}
                }
                
                res.redirect('/todos/add' )
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
        var accessToken = (req.session.accessToken || req.headers['x-accesstoken'])
        
        var teamId = ''
            , desc = ''
            , assignement = ''
        
        Session.getUserId(accessToken).then((userId) => {
            /* Check if the user is really in the requested team */
            /*
                On suppose ici que si l'utilisateur n'appartient pas à l'équipe à laquelle il souhaite ajouter
                la tâche, on ne l'assigne que pour lui même. On pourrait aussi lui renvoyer une erreur.
                T0D0: Send an error if the user is not in the requested team.
            */
            if(req.body.teamId && req.body.teamId != '' && Team.userInTeam(userId.userId, req.body.teamId)) {
                teamId = req.body.teamId
            }
            
            /* Only used in JSON API yet */
            if(req.body.assignementId && req.body.assignementId != '' && Team.userInTeam(req.body.assignementId, req.body.teamId)) {
                assignement = req.body.assignementId
            }
            
            if(req.body.desc && req.body.desc != '') {
                desc = req.body.desc
            }
            
            var params = {
                'userId' : userId.userId,
                'teamId' : teamId,
                'title' : req.body.title,
                'desc' : desc,
                'assignement' : assignement
            }
            
            Todos.insert(params).then((result) => {
                res.format({
                    html: () => { 
                        /* TODO: Add a session flash to alert user his modification is OK */
                        res.redirect('/todos')
                    },
                    json: () => {
                        res.send({
                            status: 'success',
                            data: result,
                            message: null
                        })
                    }
                })
            })
        }).catch(next)
    }
    
})

router.put('/:id', (req, res, next) => {
	console.log('- Route => Edit todo by id (PUT)')
    
    Todos.getById(req.params.id).then((task) => {
        if(!task) {
            /* No task found with this id */
            var errorList = []
            errorList.push('Aucune tâche n\'a été trouvée avec cet identifiant.')
            
            res.format({
                html: () => { 
                    /* TODO: Add a session flash to alert user this task can't be found */
                    res.redirect('/todos') },
                json: () => {
                    res.send({
                        status: 'error',
                        data: null,
                        message: errorList
                    })
                }
            })   
        }
        
        var errorList = []
        
        if(req.body.title && req.body.title == '') {
            /* No title set for this task */
            errorList.push('Le nom de la tâche ne peut pas être vide.') 
        }
        
        if(task.teamId != '' &&
            req.body.assignementId && req.body.assignementId != '' &&
            !Team.userInTeam(req.body.assignementId, req.body.teamId)) {
            /* No title set for this task */
            errorList.push('Cet utilisateur ne fait pas partie de l\'équipe à laquelle appartient cette tâche.')
        }
        
        console.log(errorList)
        console.log(errorList.length)
        
        if(errorList.length > 0) {
            console.log('Je suis ici.')
            res.format({
                html: () => { 
                    /* TODO: Add a session flash to alert with the errors */
                    res.redirect('/todos') },
                json: () => {
                    res.send({
                        status: 'error',
                        data: null,
                        message: errorList
                    })
                }
            })
        } else {
            console.log('Je suis là.')
            var accessToken = (req.session.accessToken || req.headers['x-accesstoken'])
            
            Session.getUserId(accessToken).then((userId) => {
                if(task.userId = userId.userId || (task.teamId != '' && Team.userInTeam(userId.userId, task.teamId))) {
                    
                    var params = {}
                    
                    if(req.body.title) params.title = req.body.title
                    if(req.body.desc) params.desc = req.body.desc
                    if(req.body.assignementId) params.assignedTo = req.body.assignementId
                    if(req.body.completion == true) {
                        params.completedAt = new Date().getTime()
                        params.completedBy = userId.userId
                    }
                    
                    Todos.insert(req.params.id, params).then((result) => {
                        res.format({
                            html: () => { 
                                /* TODO: Add a session flash to alert user his modification is OK */
                                res.redirect('/todos') },
                            json: () => {
                                res.send({
                                    status: 'success',
                                    data: result,
                                    message: null
                                })
                            }
                        })
                    })
                } else {
                    /* No rights on this task */
                    var errorList = []
                    errorList.push('Vous n\'avez pas les droits nécessaires pour valider cette tâche.')
                    
                    res.format({
                        html: () => { 
                            /* TODO: Add a session flash to alert user he doesn't have right to complete this task */
                            res.redirect('/todos') },
                        json: () => {
                            res.send({
                                status: 'error',
                                data: null,
                                message: errorList
                            })
                        }
                    })  
                }
            })
        }
    }).catch(next)
})

/* Todos : Delete user by id route */
router.delete('/:id', (req, res, next) => {
	console.log('- Route => Delete task by id')
    
    Todos.getById(req.params.id).then((task) => {
        if(!task) {
            /* No task found with this id */
            var errorList = []
            errorList.push('Aucune tâche n\'a été trouvée avec cet identifiant.')
            
            res.format({
                html: () => { 
                    /* TODO: Add a session flash to alert user this task can't be found */
                    res.redirect('/todos') },
                json: () => {
                    res.send({
                        status: 'error',
                        data: null,
                        message: errorList
                    })
                }
            })   
        }
        
        var accessToken = (req.session.accessToken || req.headers['x-accesstoken'])
        
        Session.getUserId(accessToken).then((userId) => {
            if(task.userId = userId.userId || (task.teamId != '' && Team.userInTeam(userId.userId, task.teamId))) {
                Todos.remove(req.params.id).then((result) => {
                    res.format({
                        html: () => { 
                            /* TODO: Add a session flash to alert user his modification is OK */
                            res.redirect('/todos') },
                        json: () => {
                            res.send({
                                status: 'success',
                                data: result,
                                message: null
                            })
                        }
                    })
                })
            } else {
                /* No rights on this task */
                var errorList = []
                errorList.push('Vous n\'avez pas les droits nécessaires pour supprimer cette tâche.')
                
                res.format({
                    html: () => { 
                        /* TODO: Add a session flash to alert user he doesn't have right to delete this task */
                        res.redirect('/todos') },
                    json: () => {
                        res.send({
                            status: 'error',
                            data: null,
                            message: errorList
                        })
                    }
                })  
            }
        })
    }).catch(next)
})

module.exports = router