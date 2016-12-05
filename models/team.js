const db = require('sqlite')

module.exports = {
    getById: (teamId) => {
        return db.get('SELECT * FROM teams WHERE id = ?', teamId)
    },
    
    getName: (teamId) => {
        return db.get('SELECT name FROM teams WHERE id = ?', teamId)
    },
    
    userInTeam: (userId, teamId) => {
        return db.get('SELECT COUNT(*) as count FROM users WHERE id = ? AND teamId = ?',
            userId,
            teamId
        ).then((result) => {
            if(result) return true
            else return false
        })
    },

    count: () => {
        return db.get('SELECT COUNT(*) as count FROM teams')
    },

    insert: (params) => {
        var teamUUID = require('uuid').v4()
        
        return db.run(
            'INSERT INTO teams (id, name, ownerId, desc, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
            teamUUID,
            params.name,
            params.userId,
            params.desc,
            new Date().getTime(),
            new Date().getTime()
        )
    },

    update: (teamId, params) => {
        const POSSIBLE_KEYS = ['name', 'desc']

        let dbArgs = []
        let queryArgs = []

        for (key in params) {
            if (~POSSIBLE_KEYS.indexOf(key)) {
                queryArgs.push(`${key} = ?`)
                dbArgs.push(params[key])
            }
        }

        queryArgs.push('updatedAt = ?')
        dbArgs.push(Date.now())

        if (!queryArgs.length) {
            let err = new Error('Bad request')
            err.status = 400
            return Promise.reject(err)
        }

        dbArgs.push(teamId)

        let query = 'UPDATE teams SET ' + queryArgs.join(', ') + ' WHERE id = ?'

        return db.run(query, dbArgs).then((stmt) => {
            if (stmt.changes === 0) {
                let err = new Error('Not Found')
                err.status = 404
                return Promise.reject(err)
            }

            return stmt
        })
    },

    remove: (teamId) => {
        return db.run('DELETE FROM teams WHERE id = ?', teamId)
    }
}