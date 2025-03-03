const bcrypt = require('bcryptjs')
const logger = require('../../utils/logger')
const { body, validationResult } = require('express-validator')
const { User } = require('../models')

// ✅ **Regisztráció validálása**
const validateRegister = [
    body('last_name').notEmpty().withMessage('A vezetéknév kötelező.'),
    body('first_name').notEmpty().withMessage('A keresztnév kötelező.'),
    body('username').notEmpty().withMessage('A felhasználónév kötelező.'),
    body('email').isEmail().withMessage('Érvényes e-mail címet adj meg.'),
    body('create_password')
        .isLength({ min: 8 })
        .withMessage('A jelszónak legalább 8 karakter hosszúnak kell lennie.')
        .matches(/[0-9]/)
        .withMessage('A jelszónak tartalmaznia kell számot.')
        .matches(/[A-Z]/)
        .withMessage('A jelszónak tartalmaznia kell nagybetűt.')
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage('A jelszónak tartalmaznia kell speciális karaktert.'),
    body('confirm_password')
        .custom((value, { req }) => value === req.body.create_password)
        .withMessage('A jelszavak nem egyeznek.'),
]

// ✅ **Regisztráció kezelése**
const register = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { last_name, first_name, username, email, create_password } = req.body

    try {
        // 🟢 **Megnézzük, van-e már regisztrált felhasználó**
        const userCount = await User.count()
        const role = userCount === 0 ? 'admin' : 'user'

        // 🟢 **Ellenőrizzük, hogy az e-mail vagy a felhasználónév már létezik-e**
        const existingUser = await User.findOne({
            where: {
                email,
            },
        })

        if (existingUser) {
            return res.status(400).json({ errors: [{ msg: 'A felhasználónév vagy az e-mail cím már foglalt.' }] })
        }

        // 🟢 **Jelszó hash-elése**
        const hashedPassword = await bcrypt.hash(create_password, 10)
        const fullName = `${last_name} ${first_name}`

        // 🟢 **Felhasználó létrehozása**
        await User.create({
            name: fullName,
            username,
            email,
            password: hashedPassword,
            role,
        })

        logger.info(`Új felhasználó regisztrált: ${username} (${email}), szerep: ${role}`)

        req.session.message = {
            message: 'Sikeres regisztráció!',
            type: 'success',
        }

        return res.json({ success: true, redirect: '/login' })
    } catch (error) {
        logger.error(`Hiba történt a regisztráció során: ${error.message}`)
        return res.status(500).json({ errors: [{ msg: 'Szerverhiba történt, próbáld újra!' }] })
    }
}

module.exports = { register, validateRegister }
