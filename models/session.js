const db = require('sqlite')
    , crypto = require('crypto')

module.exports = {
    get: (userId) => {
        return db.get('SELECT * FROM sessions WHERE userId = ?', userId)
    },
    
    getUserId: (accessToken) => {
        return db.get('SELECT userId FROM sessions WHERE accessToken = ?', accessToken)
    },
    
    checkAuth: (accessToken) => {
        return db.get('SELECT expiresAt FROM sessions WHERE accessToken = ?',
            accessToken
        ).then((result) => {
            if(result) {
                if(result.expiresAt > new Date().getTime()) {
                    return true
                } else {
                    remove(result.userId)
                    return false
                }
            } else {
                return false
            }
        })
    },
    
    insert: (userId) => {
        return db.run(
            'INSERT INTO sessions (userId, accessToken, createdAt, expiresAt) VALUES (?, ?, ?, ?)',
            userId,
            crypto.randomBytes(64).toString('hex'),
            new Date().getTime(),
            /* 12 hours session time expiration */
            new Date().getTime() + 43200000
        )
    },
      
    remove: (userId) => {
        return db.run('DELETE FROM sessions WHERE userId = ?', userId)
    }
};