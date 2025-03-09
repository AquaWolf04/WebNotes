const express = require('express')
const csrf = require('csurf')
const authMiddleware = require('../middlewares/authMiddleware')

// ✅ Kontrollerek importálása
const RegisterController = require('../app/controllers/RegisterController.js')
const AppController = require('../app/controllers/AppController.js')
const LoginController = require('../app/controllers/LoginController.js')
const NotesController = require('../app/controllers/NotesController.js')

// ✅ CSRF védelem
const csrfProtection = csrf({ cookie: true })

// ✅ Router példány létrehozása
const router = express.Router()

// ✅ Nevesített útvonalak táblázata
const routes = {
    home: '/',
    login: '/login',
    register: '/register',
    logout: '/logout',
    version: '/api/version',
    me: '/api/me',
    notesList: '/notes/list',
    notesSave: '/notes/save',
    csrfToken: '/csrf-token',
}

// ✅ Oldalak renderelése
router.get(routes.home, authMiddleware, (req, res) => {
    res.render('index', { user: req.session.userId })
})

router.get(routes.login, (req, res) => res.render('login'))
router.get(routes.register, (req, res) => res.render('register'))

// ✅ Felhasználó kezelés
router.post(routes.login, LoginController.login)
router.get(routes.logout, LoginController.logout)
router.post(
    routes.register,
    RegisterController.validation,
    csrfProtection,
    RegisterController.register
)

// ✅ API végpontok
router.get(routes.version, AppController.getVer)
router.get(routes.me, authMiddleware, AppController.me)

// ✅ Védett végpontok
router.get(routes.notesList, NotesController.list)
router.post(routes.notesSave, csrfProtection, NotesController.save)

// ✅ CSRF Token lekérés
router.get(routes.csrfToken, csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() })
})

// ✅ Exportálás
module.exports = { router, routes }
