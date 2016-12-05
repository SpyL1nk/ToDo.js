const db = require('sqlite')

module.exports = {
    getById: (todoId) => {
        return db.get('SELECT * FROM todos WHERE id = ?', todoId)
    },

    getByUserId: (userId) => {
        return db.all('SELECT * FROM todos WHERE userId = ? ORDER BY createdAt DESC', userId)
    },

    getByTeamId: (teamId) => {
        return db.all('SELECT * FROM todos WHERE teamId = ? ORDER BY createdAt DESC', teamId)
    },

    count: () => {
        return db.get('SELECT COUNT(*) as count FROM todos')
    },

    countByUser: (userId) => {
        return db.get('SELECT COUNT(*) as count FROM todos WHERE userId = ?', userId)
    },

    countByTeam: (teamId) => {
        return db.get('SELECT COUNT(*) as count FROM todos WHERE teamId = ?', teamId)
    },

    insert: (params) => {
        var todoUUID = require('uuid').v4()
        
        return db.run(
            'INSERT INTO todos (id, userId, teamId, title, desc, createdAt, updatedAt, completedAt, assignedTo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            todoUUID,
            params.userId,
            params.teamId,
            params.title,
            params.desc,
            new Date().getTime(),
            new Date().getTime(),
            0,
            params.assignement
        )
    },

    update: (todoId, params) => {
        const POSSIBLE_KEYS = ['title', 'desc', 'completedAt', 'assignedTo']

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

        dbArgs.push(todoId)

        let query = 'UPDATE todos SET ' + queryArgs.join(', ') + ' WHERE id = ?'

        return db.run(query, dbArgs).then((stmt) => {
            if (stmt.changes === 0) {
                let err = new Error('Not Found')
                err.status = 404
                return Promise.reject(err)
            }

            return stmt
        })
    },

    remove: (todoId) => {
        return db.run('DELETE FROM todos WHERE id = ?', todoId)
    }
}