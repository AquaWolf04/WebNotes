const { User } = require('../../app/models')

// Visszaadja a bejelentkezett felhasználó adatait (ASZINKRON)
const me = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res
                .status(401)
                .json({ errors: [{ msg: 'Nincs bejelentkezve' }] })
        }

        const user = await User.findByPk(req.session.userId, {
            attributes: ['id', 'username', 'email', 'role'],
        })

        if (!user) {
            return res
                .status(404)
                .json({ errors: [{ msg: 'Felhasználó nem található' }] })
        }

        return res.json({ user })
    } catch (err) {
        console.error('Me error:', err)
        return res.status(500).json({
            errors: [{ msg: 'Szerverhiba történt. Próbáld újra később!' }],
        })
    }
}

// Az alkalmazás verzióját adja vissza (SZINKRON)
const getVer = (req, res) => {
    return res.json({ version: process.env.VERSION || 'NaN' }) // Alapértelmezett érték, ha nincs beállítva
}

module.exports = {
    me,
    getVer,
}
