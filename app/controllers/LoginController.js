const { User } = require('../../app/models')
const bcrypt = require('bcryptjs')

// Bejelentkezés
const login = async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ errors: [{ msg: 'Felhasználónév és jelszó megadása kötelező' }] })
    }

    try {
        const user = await User.findOne({ where: { username } })

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ errors: [{ msg: 'Hibás felhasználónév vagy jelszó' }] })
        }

        req.session.userId = user.id

        return res.json({ success: true, redirect: '/' })
    } catch (err) {
        console.error('Login error:', err)
        return res.status(500).json({ errors: [{ msg: 'Szerverhiba történt. Próbáld újra később!' }] })
    }
}

// Kijelentkezés
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err)
            return res.status(500).json({ errors: [{ msg: 'Szerverhiba történt. Próbáld újra később!' }] })
        }
        res.redirect('/login')
    })
}

module.exports = {
    login,
    logout,
}
