const Redis = require('ioredis')
    , bcrypt = require('bcrypt-nodejs')
    
const redis = new Redis()

module.exports = {
    get: (userId) => {
        return redis.hgetall("user:" + userId)
    },
    
  /*
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
  */

    count: () => {
        return redis.get('countUser')
    },

    getAll: (limit) => {
        var pipeline = redis.pipeline()
        
        return redis.smembers('users').then((users) => {
            var lim = 0
            var userList = []
            for (var userId in users) {
                lim++
                pipeline.hgetall("user:" + userId)
            }
            
            return pipeline.exec()
        })
    },

    insert: (params) => {
        var pipeline = redis.pipeline()
        , userUUID = require('uuid').v4()
        
        pipeline.hmset("user:" + userUUID, {
            id: userUUID,
            pseudonyme: params.pseudonyme,
            email: params.email,
            password: bcrypt.hashSync(params.password),
            firstname: params.firstname,
            lastname: params.lastname,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime()
        })
        
        console.log('userId:', userUUID)
        
        pipeline.sadd("users", userUUID)
        pipeline.incr("countUser")
        
        return pipeline.exec()
    },

    update: (userId, params) => {
        const POSSIBLE_KEYS = ['pseudonyme', 'email', 'password', 'firstname', 'lastname']

        let dbArgs = {}
        let queryArgs = []

        for (key in params) {
          if (~POSSIBLE_KEYS.indexOf(key)) {
            queryArgs.push(key)
            if (key === 'password') dbArgs.set(key, bcrypt.hashSync(params[key]))
            else dbArgs.set(key, params[key])
          }
        }

        queryArgs.push('updatedAt')
        dbArgs.push(Date.now())

        if (!queryArgs.length) {
          let err = new Error('Bad request')
          err.status = 400
          return Promise.reject(err)
        }

        for(key in queryArgs) {
            pipeline.hset("user:" + userId, key, dbArgs[key])
        }

        return pipeline.exec()
    },

    remove: (userId) => {
        pipeline.del("user:" + userId)
        pipeline.decr("userCount")
        
        return pipeline.exec()
    }
}