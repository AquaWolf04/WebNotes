const express = require('express')
const router = express.Router()
const csrf = require('csurf')
const jwt = require('jsonwebtoken')
const { User } = require('../app/models')
const authenticateToken = require('../middlewares/authMiddleware')

const { register, validateRegister } = require('../app/controllers/RegisterController.js')
const lcontroller = require('../app/controllers/LoginController.js')
const ncontroller = require('../app/controllers/NotesController.js')

const csrfProtection = csrf({ cookie: true })

// ✅ **Oldalak renderelése**
router.get('/', (req, res) => res.render('index', { user: req.user }))
router.get('/login', (req, res) => res.render('login'))
router.get('/register', (req, res) => res.render('register'))

// ✅ **Felhasználói adatok lekérése (védett)**
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.user.id },
            attributes: ['id', 'username', 'name', 'email', 'role'],
        })

        if (!user) {
            return res.status(404).json({ success: false, error: 'Felhasználó nem található' })
        }

        res.json({ success: true, user })
    } catch (error) {
        console.error('🔴 Hiba a felhasználó lekérésekor:', error)
        res.status(500).json({ success: false, error: 'Szerverhiba' })
    }
})

// ✅ **Jegyzetek lekérése (védett)**
router.get('/notes/list', authenticateToken, ncontroller.list)

// ✅ **Jegyzet mentése (védett)**
router.post('/notes/save', authenticateToken, ncontroller.save)

// ✅ **Bejelentkezés és kijelentkezés**
router.post('/login', lcontroller.login)
router.post('/logout', lcontroller.logout)

// ✅ **Regisztráció (CSRF-védelem)**
router.post('/register', csrfProtection, validateRegister, register)

// ✅ **CSRF Token lekérése**
router.get('/csrf-token', csrfProtection, authenticateToken, (req, res) => {
    res.json({ csrfToken: req.csrfToken() })
})

// ✅ **Access Token frissítés (Refresh Token segítségével)**
router.post('/refresh', async (req, res) => {
    // 🔍 **Refresh whitout csrf
    const { refreshToken } = req.body

    if (!refreshToken) {
        return res.status(401).json({ success: false, error: 'Nincs érvényes token, jelentkezz be!' })
    }

    try {
        const user = await User.findOne({ where: { refreshToken } })

        if (!user) {
            return res.status(400).json({ success: false, error: 'Hibás token, jelentkezz be!' })
        }

        const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '15m',
        })

        res.json({ success: true, accessToken })
    } catch (error) {
        console.error('🔴 Hiba a token frissítésekor:', error)
        res.status(500).json({ success: false, error: 'Szerverhiba' })
    }
})

module.exports = router
