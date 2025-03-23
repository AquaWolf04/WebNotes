const { User } = require('../../app/models')
const { sendEmailVerification } = require('../../utils/mailer')

/*
 *   Email cím modosítása
 */

const changeEmail = async (req, res) => {
    try {
        // Bejelentkezett felhasználó lekérése
        const user = await User.findByPk(req.session.userId)

        // Ha nincs ilyen felhasználó, akkor hibát dobunk
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Felhasználó nem található!',
            })
        }

        // Új email cím beállítása
        const newEmail = req.body.email
        const password = req.body.password

        // Ha a jelszó nem egyezik, akkor hibát dobunk
        if (!user.validPassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'A jelszó nem egyezik!',
            })
        }

        // Nézzük meg, hogy van-e már ilyen email cím
        const existingUser = await User.findOne({ where: { email: newEmail } })

        // Ha van már ilyen email cím, akkor hibát dobunk
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Ez az email cím már foglalt!',
            })
        }
        console.log('🟢 Küldjük az emailt ide:', newEmail)

        await sendEmailVerification(user, newEmail, user.email)

        return res.json({
            success: true,
            message:
                'Az email címed megváltoztatásához szükséges lépéseket elküldtük a megadott email címre!',
        })

        // SMTP email ki küldése a régi és az új email címre
    } catch (err) {
        console.error('Change email error:', err)
        return res.status(500).json({
            success: false,
            message: 'Szerverhiba történt. Próbáld újra később!',
        })
    }
}

module.exports = {
    changeEmail,
}
