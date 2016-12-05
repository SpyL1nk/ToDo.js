const db = require('sqlite')
    , bcrypt = require('bcrypt-nodejs')

module.exports = {
    getAll: (limit, offset) => {
        return db.all('SELECT * FROM users')
    },
    
    get: (userId) => {
        return db.get('SELECT * FROM users WHERE id = ?', userId)
    },
    
    getName: (userId) => {
        return db.get('SELECT pseudonyme FROM users WHERE id = ?', userId)
    },
  
    getTeamId: (userId) => {
        return db.get('SELECT teamId FROM users WHERE id = ?', userId)
    },
    
    checkAuth: (pseudonyme, password) => {
        return db.get(
            'SELECT id, password FROM users WHERE pseudonyme = ?',
            pseudonyme
        ).then((result) => {
            if(bcrypt.compareSync(password, result.password)) {
                return result.id
            } else {
                return null
            }
        })
    },

    count: () => {
        return db.get('SELECT COUNT(*) as count FROM users')
    },

    insert: (params) => {
        var userUUID = require('uuid').v4()
        
        return db.run(
            'INSERT INTO users (id, pseudonyme, email, password, firstname, lastname, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            userUUID,
            params.pseudonyme,
            params.email,
            bcrypt.hashSync(params.password),
            params.firstname,
            params.lastname,
            new Date().getTime(),
            new Date().getTime()
        )
    },

    update: (userId, params) => {
        const POSSIBLE_KEYS = ['pseudonyme', 'email', 'password', 'firstname', 'lastname']

        let dbArgs = []
        let queryArgs = []

        for (key in params) {
            if (~POSSIBLE_KEYS.indexOf(key)) {
                queryArgs.push(`${key} = ?`)
                if (key === 'password') dbArgs.push(bcrypt.hashSync(params[key]))
                else dbArgs.push(params[key])
            }
        }

        queryArgs.push('updatedAt = ?')
        dbArgs.push(Date.now())

        if (!queryArgs.length) {
            let err = new Error('Bad request')
            err.status = 400
            return Promise.reject(err)
        }

        dbArgs.push(userId)

        let query = 'UPDATE users SET ' + queryArgs.join(', ') + ' WHERE rowid = ?'

        return db.run(query, dbArgs).then((stmt) => {
            if (stmt.changes === 0) {
                let err = new Error('Not Found')
                err.status = 404
                return Promise.reject(err)
            }

            return stmt
        })
    },

    remove: (userId) => {
        return db.run('DELETE FROM users WHERE id = ?', userId)
    }
}