const jwt = require('jsonwebtoken')

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']

    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ success: false, error: 'Nincs érvényes token, jelentkezz be!' })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Érvénytelen token, jelentkezz be újra!' })
        }

        req.user = user
        next()
    })
}

module.exports = authenticateToken
