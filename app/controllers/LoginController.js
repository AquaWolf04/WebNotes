const { User } = require('../../app/models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwtHelper')

const login = async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ errors: [{ msg: 'Felhasználónév és jelszó megadása kötelező' }] })
    }

    try {
        const user = await User.findOne({ where: { username } })

        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Hibás felhasználónév vagy jelszó' }] })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Hibás felhasználónév vagy jelszó' }] })
        }

        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)

        user.refreshToken = refreshToken
        await user.save()

        return res.json({
            success: true,
            accessToken,
            refreshToken,
            redirect: '/', // ✅ Mindig legyen egyértelmű átirányítás
        })
    } catch (err) {
        console.error('Login error:', err)
        return res.status(500).json({
            errors: [{ msg: 'Szerverhiba történt. Próbáld újra később!' }],
        })
    }
}

const logout = async (req, res) => {
    // 🔍 **JWT accessToken ellenőrzése**
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ success: false, error: 'Nincs érvényes token, jelentkezz be!' })
    }

    try {
        // ✅ **JWT dekódolása és userId kinyerése**
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const userId = decoded.id // Feltételezve, hogy az ID benne van a tokenben

        // 🔍 **Felhasználó keresése és refresh token törlése**
        const user = await User.findByPk(userId)
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Nem található felhasználó' }] })
        }

        user.refreshToken = null
        await user.save()

        return res.json({ success: true, message: 'Sikeres kijelentkezés.' })
    } catch (err) {
        console.error('Logout error:', err)
        return res.status(500).json({
            errors: [{ msg: 'Szerverhiba történt. Próbáld újra később!' }],
        })
    }
}

module.exports = {
    login,
    logout,
}
