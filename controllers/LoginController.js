const connectDB = require('../config/db')
const bcrypt = require('bcryptjs')

const login = async (req, res, next) => {
    const { username, password, _csrf } = req.body // CSRF tokent is ellenőrizzük

    if (!username || !password) {
        return res.status(400).json({
            errors: [{ msg: 'Felhasználónév és jelszó megadása kötelező' }],
        })
    }

    const query = 'SELECT * FROM users WHERE username = ?'
    const values = [username]

    try {
        const [code, result] = await connectDB(query, values)

        if (code == 1 || result.length == 0) {
            return res.status(400).json({
                errors: [{ msg: 'Hibás felhasználónév vagy jelszó' }],
            })
        }

        const user = result[0]
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({
                errors: [{ msg: 'Hibás felhasználónév vagy jelszó' }],
            })
        }

        // Felhasználó beléptetése
        req.session.user = {
            id: user.id,
            name: user.name,
            role: user.role,
            username: user.username,
            email: user.email,
        }

        return res.json({ success: true, redirect: '/' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({
            errors: [{ msg: 'Szerverhiba történt. Próbáld újra később!' }],
        })
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
