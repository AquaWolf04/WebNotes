const express = require('express')
const router = express.Router()
const csrf = require('csurf')
const { User } = require('../app/models')
const authMiddleware = require('../middlewares/authMiddleware')

// ✅ **Kontrollerek importálása**
const RegisterController = require('../app/controllers/RegisterController.js')
const AppController = require('../app/controllers/AppController.js')
const LoginController = require('../app/controllers/LoginController.js')
const NotesController = require('../app/controllers/NotesController.js')

// ✅ **CSRF védelem beállítása**
const csrfProtection = csrf({ cookie: true })

/* ===========================
        OLDALAK RENDERELÉSE
   =========================== */
router.get('/', authMiddleware, (req, res) => {
    res.render('index', { user: req.session.userId })
})

router.get('/login', (req, res) => res.render('login'))
router.get('/register', (req, res) => res.render('register'))

/* ===========================
       FELHASZNÁLÓ KEZELÉS
   =========================== */
router.post('/login', LoginController.login)
router.get('/logout', LoginController.logout)
router.post('/register', csrfProtection, RegisterController.register, RegisterController.validation)

/* ===========================
       VÉDETT ENDPOINT-OK
   =========================== */
router.get('/me', authMiddleware, AppController.me)
router.get('/notes/list', NotesController.list)
router.post('/notes/save', csrfProtection, NotesController.save)

/* ===========================
        CSRF TOKEN LEKÉRÉS
   =========================== */
router.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() })
})

module.exports = router
