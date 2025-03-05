const { User } = require('../../app/models')

const me = async (req, res) => {
    try {
        const user = await User.findByPk(req.session.userId, {
            attributes: ['id', 'username', 'email', 'role'],
        })

        if (!user) {
            return res.status(404).json({ errors: [{ msg: 'Felhasználó nem található' }] })
        }

        return res.json({ user })
    } catch (err) {
        console.error('Me error:', err)
        return res.status(500).json({ errors: [{ msg: 'Szerverhiba történt. Próbáld újra később!' }] })
    }
}

module.exports = {
    me,
}
