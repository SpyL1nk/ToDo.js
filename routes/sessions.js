const router = require('express').Router()
const sqlite = require('sqlite')

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
    
    

    res.format({
        html: () => {
            
        },
        json: () => {
            let err = new Error('Bad Request')
            err.status = 400
            next(err)
        }
    })
})

module.exports = router