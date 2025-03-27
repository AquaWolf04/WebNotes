const { User, EmailChangeCode } = require('../../app/models')
const { Op } = require('sequelize')
const {
    sendEmailVerification,
    passwordChangedNotification,
    send6DigitCode,
} = require('../../utils/mailer')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

// 🔐 Email cím megváltoztatásához szükséges ellenőrzés és 6 jegyű kód küldése (régi emailre)
const checkDetails = async (req, res) => {
    try {
        const user = await User.findByPk(req.session.userId)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Felhasználó nem található!',
            })
        }

        const newEmail = req.body.email
        const password = req.body.password

        if (!newEmail || !password) {
            return res.status(400).json({
                success: false,
                message: 'Az új email cím és jelszó megadása kötelező!',
            })
        }

        if (!user.validPassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Helytelen jelszó!',
            })
        }

        const existingUser = await User.findOne({ where: { email: newEmail } })

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Ez az email cím már foglalt!',
            })
        }

        const digits = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 perc

        await EmailChangeCode.create({
            user_id: user.id,
            code: digits,
            used: false,
            expiresAt,
            new_email: newEmail,
        })

        await send6DigitCode(user, user.email, digits) // küldés régi emailre

        req.session.newEmail = newEmail

        return res.status(200).json({
            success: true,
            message: 'A kód elküldve a jelenlegi email címedre.',
        })
    } catch (err) {
        console.error('❌ Change email error:', err)
        return res.status(500).json({
            success: false,
            message: 'Szerverhiba történt. Próbáld újra később!',
        })
    }
}

// ✅ 6 jegyű kód ellenőrzése → új emailre megerősítő link küldése
const verifyCode = async (req, res) => {
    const code = req.body.code

    if (!code) {
        return res.status(400).json({
            success: false,
            message: 'Hiányzik a kód!',
        })
    }

    try {
        const data = await EmailChangeCode.findOne({
            where: {
                code,
                used: false,
                expiresAt: { [Op.gt]: new Date() },
            },
        })

        if (!data) {
            return res.status(400).json({
                success: false,
                message: 'Hibás vagy lejárt kód!',
            })
        }

        const user = await User.findByPk(data.user_id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Felhasználó nem található!',
            })
        }

        data.used = true
        await data.save()

        const newEmail = req.session.newEmail

        await sendEmailVerification(user, newEmail, user.email) // új emailre megerősítő link

        return res.status(200).json({
            success: true,
            message: 'Kiment az új email címre a megerősítő link!',
        })

        delete req.session.newEmail
    } catch (err) {
        console.error('❌ Verify code error:', err)
        return res.status(500).json({
            success: false,
            message: 'Szerverhiba történt. Próbáld újra később!',
        })
    }
}

// 📩 Token alapú megerősítés → tényleges email frissítés
const changeEmail = async (req, res) => {
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

// 🔒 Jelszó módosítás
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

        const { currentPassword, newPassword, confirmPassword } = req.body

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'A jelszavak nem egyeznek!',
            })
        }

        if (!user.validPassword(currentPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Helytelen jelenlegi jelszó!',
            })
        }

        user.password = user.generateHash(newPassword)
        await user.save()

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
    checkDetails,
    changeEmail,
    changePassword,
    verifyCode,
}
