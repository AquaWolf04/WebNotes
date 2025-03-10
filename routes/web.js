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

// ✅ Oldal renderelése
router.get('/', authMiddleware, (req, res) => {
    res.render('index', { user: req.session.userId })
})

// ✅ Autehntikáció kezelése
router.get('/login', (req, res) => res.render('login'))
router.get('/register', (req, res) => res.render('register'))

router.post('/login', csrfProtection, LoginController.login)
router.get('/logout', LoginController.logout)
router.post('/register', csrfProtection, RegisterController.validation, RegisterController.register)

// ✅ API végpontok
router.get('/api/version', AppController.getVer)
router.get('/api/me', authMiddleware, AppController.me)

// Jegyzetek kilistázása
router.get('/notes/list', NotesController.list)
// Jegyzet mentése
router.post('/notes/save', csrfProtection, NotesController.save)
// Jegyzet betöltése ID alapján
router.get('/notes/finbyid/:id', NotesController.loadbyid)

// Jegyzetek törlése
router.delete('/notes/delete/:id', NotesController.remove)

// ✅ Exportálás
module.exports = router
