const { expressjwt: jwt } = require('express-jwt')

function authJwt() {
    const secret = process.env.secret
    const api = process.env.API_URL
    return jwt({
        secret,
        algorithms: ['HS256'],
        // isRevoked: isRevoked,
    })
    // .unless({
    //     path: [
    //         //allow users only GET products
    //         // { url: `${api}/products`, methods: ['GET', 'OPTIONS'] },
    //         { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
    //         { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
    //         `${api}/users/login`,
    //         `${api}/users/register`,
    //     ],
    // })
}

async function isRevoked(req, payload, done) {
    if (!payload.isAdmin) {
        done(null, true)
    }
    done()
}

<<<<<<< HEAD
module.exports = authJwt
=======
module.exports = authJwt
>>>>>>> debugging
