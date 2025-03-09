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
    version: '/version',
    me: '/me',
    notesById: '/:id',
    notesList: '/list',
    notesSave: '/save',
}

const prefix = {
    api: '/api',
    notes: '/notes',
}

// ✅ Oldal renderelése
router.get(routes.home, authMiddleware, (req, res) => {
    res.render('index', { user: req.session.userId })
})

// ✅ Autehntikáció kezelése
router.get(routes.login, (req, res) => res.render('login'))
router.get(routes.register, (req, res) => res.render('register'))

router.post(routes.login, csrfProtection, LoginController.login)
router.get(routes.logout, LoginController.logout)
router.post(
    routes.register,
    csrfProtection,
    RegisterController.validation,
    RegisterController.register
)

// ✅ API végpontok
router.get(prefix.api + routes.version, AppController.getVer)
router.get(prefix.api + routes.me, authMiddleware, AppController.me)

// ✅ Jegyzetek kezelése
router.get(prefix.notes + routes.notesList, NotesController.list)
router.post(
    prefix.notes + routes.notesSave,
    csrfProtection,
    NotesController.save
)
router.get(prefix.notes + routes.notesById, NotesController.loadbyid)

// ✅ Exportálás
module.exports = { router, routes }
