const bcrypt = require('bcryptjs')
const logger = require('../../utils/logger')
const { body, validationResult } = require('express-validator')
const { User } = require('../models')

// Regisztrációs validáció
const validation = [
    body('username').notEmpty().withMessage('A felhasználónév kötelező.'),
    body('email')
        .notEmpty()
        .withMessage('Az email mező nem lehet üres.')
        .isEmail()
        .withMessage('Érvényes e-mail címet adj meg.'),
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

// Regisztráció
const register = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        req.session.message = {
            message: 'Hibás adatbevitel!',
            type: 'error',
        }
        return res.status(400).json({ errors: errors.array() })
    }

    const { username, email, create_password } = req.body

    try {
        const userCount = await User.count()
        const role = userCount === 0 ? 'admin' : 'user'

        const existingUser = await User.findOne({ where: { email } })

        if (existingUser) {
            req.session.message = {
                message: 'A felhasználónév vagy az e-mail cím már foglalt.',
                type: 'error',
            }
            return res.status(400).json({
                errors: [
                    {
                        msg: 'A felhasználónév vagy az e-mail cím már foglalt.',
                    },
                ],
            })
        }

        const hashedPassword = await bcrypt.hash(create_password, 10)

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role,
        })

        logger.info(`Új felhasználó regisztrált: ${username} (${email}), szerep: ${role}`)

        req.session.user = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
        }

        req.session.message = {
            message: 'Sikeres regisztráció!',
            type: 'success',
        }

        return res.json({ success: true, redirect: '/' })
    } catch (error) {
        logger.error(`Hiba történt a regisztráció során: ${error.message}`)
        req.session.message = {
            message: 'Szerverhiba történt, próbáld újra!',
            type: 'error',
        }
        return res.status(500).json({ errors: [{ msg: 'Szerverhiba történt, próbáld újra!' }] })
    }
}

module.exports = {
    register,
    validation,
}
