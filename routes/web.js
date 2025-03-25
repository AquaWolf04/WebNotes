const express = require('express')
const csrf = require('csurf')
const authMiddleware = require('../middlewares/authMiddleware')

// ✅ Kontrollerek importálása
const RegisterController = require('../app/controllers/RegisterController.js')
const AppController = require('../app/controllers/AppController.js')
const LoginController = require('../app/controllers/LoginController.js')
const NotesController = require('../app/controllers/NotesController.js')
const AccountController = require('../app/controllers/AccountController.js')
const { route } = require('express-named-router')

// Validatorok importálása
const { registerValidator } = require('../validators/registerValidator.js')
const { changePasswordValidator } = require('../validators/changePasswordValidator.js')

// ✅ CSRF védelem
const csrfProtection = csrf({ cookie: true })

// ✅ Router példány létrehozása
const router = express.Router()

// ✅ Oldal renderelése
router.get('/', authMiddleware, (req, res) => {
    res.render('index', { user: req.session.userId })
})

// Profil oldal
router.get('/account', authMiddleware, (req, res) => {
    res.render('account', { user: req.session.userId })
})
router.post('/account/change-email', csrfProtection, authMiddleware, AccountController.changeEmail)
router.get('/account/confirm-email-change/:token', authMiddleware, AccountController.confirmEmailChange)
router.post(
    '/account/change-password',
    csrfProtection,
    authMiddleware,
    changePasswordValidator,
    AccountController.changePassword
)

// ✅ Autehntikáció kezelése
router.get('/login', (req, res) => res.render('login'))
router.get('/register', (req, res) => res.render('register'))

router.post('/login', csrfProtection, LoginController.login)
router.get('/logout', LoginController.logout)
router.post('/register', csrfProtection, registerValidator, RegisterController.register)

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

// Jegyzetek frissítése
router.put('/notes/update/:id', csrfProtection, NotesController.edit)

// ✅ Exportálás
module.exports = router
