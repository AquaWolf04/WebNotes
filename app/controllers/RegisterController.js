const bcrypt = require('bcryptjs')
const logger = require('../../utils/logger')
const { body, validationResult } = require('express-validator')
const { User } = require('../models')

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
}
