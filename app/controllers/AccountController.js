const { User } = require('../../app/models')
const { sendEmailVerification, passwordChangedNotification } = require('../../utils/mailer')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

// Email cím megváltoztatásához szükséges SMTP email küldése
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
        await sendEmailVerification(user, newEmail, user.email)

        return res.json({
            success: true,
            message: 'Az email címed megváltoztatásához szükséges lépéseket elküldtük a megadott email címre!',
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

// Email cím megváltoztatásának megerősítése
const confirmEmailChange = async (req, res) => {
    const token = req.params.token

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'Hiányzik a token!',
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.EMAIL_SECRET)

        const user = await User.findByPk(decoded.userId)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Felhasználó nem található!',
            })
        }

        // Email frissítés csak akkor, ha még nem egyezik
        if (user.email === decoded.newEmail) {
            return res.status(400).json({
                success: false,
                message: 'Ez az email cím már be van állítva.',
            })
        }

        user.email = decoded.newEmail
        await user.save()

        return res.status(200).json({
            success: true,
            message: 'Az email címed sikeresen megváltoztatva!',
        })
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(400).json({
                success: false,
                message: 'A megerősítő link lejárt!',
            })
        }

        console.error('❌ Confirm email change error:', err)
        return res.status(500).json({
            success: false,
            message: 'Szerverhiba történt. Próbáld újra később!',
        })
    }
}

// Jelszó megváltoztatása
const changePassword = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Hibás adatbevitel!',
                errors: errors.array(),
            })
        }

        const user = await User.findByPk(req.session.userId)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Felhasználó nem található!',
            })
        }

        const currentPassword = req.body.currentPassword
        const newPassword = req.body.newPassword
        const confirmPassword = req.body.confirmPassword

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'A jelszavak nem egyeznek!',
            })
        }

        user.password = user.generateHash(newPassword)
        await user.save()

        // Jelszó megváltozásáról email küldése
        await passwordChangedNotification(user)

        return res.status(200).json({
            success: true,
            message: 'A jelszavad sikeresen megváltoztatva!',
        })
    } catch (err) {
        console.error('❌ Change password error:', err)
        return res.status(500).json({
            success: false,
            message: 'Szerverhiba történt. Próbáld újra később!',
        })
    }
}

module.exports = {
    changeEmail,
    confirmEmailChange,
    changePassword,
}
