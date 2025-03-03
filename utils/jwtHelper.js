const jwt = require('jsonwebtoken')
require('dotenv').config() // Betöltjük a környezeti változókat

const generateAccessToken = (user) => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error('❌ ACCESS_TOKEN_SECRET nincs megadva az .env fájlban!')
    }

    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET, // ⬅️ Itt kell lennie a titkos kulcsnak!
        { expiresIn: '15m' }
    )
}

const generateRefreshToken = (user) => {
    if (!process.env.REFRESH_TOKEN_SECRET) {
        throw new Error('❌ REFRESH_TOKEN_SECRET nincs megadva az .env fájlban!')
    }

    return jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
}
