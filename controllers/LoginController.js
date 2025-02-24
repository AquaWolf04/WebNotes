const { password } = require('../config/config')
const connectDB = require('../config/db')
const bcrypt = require('bcryptjs')

const login = async (req, res, next) => {
    const { username, password } = req.body

    if (!username || !password) {
        message = {
            message: 'Felhasználónév és jelszó megadása kötelező',
            type: 'error',
        }
        req.session.message = message
        return res.redirect('/')
    }

    const query = 'SELECT * FROM user WHERE username = ?'
    const values = [username]

    try {
        const [code, result] = await connectDB(query, values)

        if (code == 1 || result.length == 0) {
            message = {
                message: 'Hibás felhasználónév vagy jelszó',
                type: 'error',
            }
            req.session.message = message
            return res.redirect('/')
        }

        const user = result[0]
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            message = {
                message: 'Hibás felhasználónév vagy jelszó',
                type: 'error',
            }
            req.session.message = message
            return res.redirect('/')
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
        }

        message = {
            message: 'Sikeres bejelentkezés',
            type: 'success',
        }
        req.session.message = message
        return res.redirect('/')
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
}

const logout = (req, res) => {
    req.session.destroy()
    res.redirect('/')
}

module.exports = {
    login,
    logout,
}
