const connectDB = require('../config/db')
const bcrypt = require('bcryptjs')
const logger = require('../utils/logger')
const { body, validationResult } = require('express-validator')
const { Logger } = require('logger')
const { name } = require('ejs')

// A regisztráció validálása a következő szabályok szerint:
// - A vezetéknév kötelező.
// - A keresztnév kötelező.
// - A felhasználónév kötelező.
// - Érvényes e-mail címet adj meg.
// - A jelszónak legalább 8 karakter hosszúnak kell lennie.
// - A jelszónak tartalmaznia kell számot.
// - A jelszónak tartalmaznia kell nagybetűt.
// - A jelszavaknak egyezniük kell.
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
        .withMessage('A jelszónak tartalmaznia kell nagybetűt.'),
    body('confirm_password')
        .custom((value, { req }) => value === req.body.create_password)
        .withMessage('A jelszavak nem egyeznek.'),
]

const register = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { last_name, first_name, username, email, create_password } = req.body

    try {
        const [userCheckError, existingUsers] = await connectDB('SELECT * FROM users WHERE email = ? OR username = ?', [
            email,
            username,
        ])

        if (existingUsers.length > 0) {
            return res.status(400).json({
                errors: [{ msg: 'A felhasználónév vagy az e-mail cím már foglalt.' }],
            })
        }

        const hashedPassword = await bcrypt.hash(create_password, 10)
        const fullName = `${last_name} ${first_name}`

        const [insertError] = await connectDB(
            'INSERT INTO users (name, username, email, password, registration_date) VALUES (?, ?, ?, ?, NOW())',
            [fullName, username, email, hashedPassword]
        )

        if (insertError) {
            return res.status(500).json({ errors: [{ msg: 'Hiba történt a regisztráció során.' }] })
        }

        logger.info(`Új felhasználó regisztrált: ${username} (${email})`)

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
