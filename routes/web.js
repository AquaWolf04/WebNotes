const express = require('express')
const csrf = require('csurf')
const authMiddleware = require('../middlewares/authMiddleware')

// Kontrollerek
const RegisterController = require('../app/controllers/RegisterController')
const AppController = require('../app/controllers/AppController')
const LoginController = require('../app/controllers/LoginController')
const NotesController = require('../app/controllers/NotesController')
const AccountController = require('../app/controllers/AccountController')

// Validatorok
const { registerValidator } = require('../validators/registerValidator')
const {
    changePasswordValidator,
} = require('../validators/changePasswordValidator')

// CSRF védelem
const csrfProtection = csrf({ cookie: true })

// Router létrehozása
const router = express.Router()

// ----------- Oldal renderelések -----------
router.get('/', authMiddleware, (req, res) => {
    res.render('index', { user: req.session.userId })
})

router.get('/account', authMiddleware, (req, res) => {
    res.render('account', { user: req.session.userId })
})

router.get('/login', (req, res) => res.render('login'))
router.get('/register', (req, res) => res.render('register'))

// ----------- Autentikáció -----------
router.post('/login', csrfProtection, LoginController.login)
router.get('/logout', LoginController.logout)

router.post(
    '/register',
    csrfProtection,
    registerValidator,
    RegisterController.register
)

// ----------- Fiók műveletek -----------
router.post(
    '/account/check-details',
    csrfProtection,
    authMiddleware,
    AccountController.checkDetails
)

router.get(
    '/account/change-email/:token',
    authMiddleware,
    AccountController.changeEmail
)

router.post(
    '/account/change-password',
    csrfProtection,
    authMiddleware,
    changePasswordValidator,
    AccountController.changePassword
)

router.post(
    '/account/verify-code',
    csrfProtection,
    authMiddleware,
    AccountController.verifyCode
)

// ----------- Jegyzetek -----------
router.get('/notes/list', NotesController.list)
router.post('/notes/save', csrfProtection, NotesController.save)
router.get('/notes/finbyid/:id', NotesController.loadbyid)
router.delete('/notes/delete/:id', NotesController.remove)
router.put('/notes/update/:id', csrfProtection, NotesController.edit)
router.get('/notes/share/:id/init', NotesController.shareInit)

// ----------- API végpontok -----------
router.get('/api/version', AppController.getVer)
router.get('/api/me', authMiddleware, AccountController.me)

// ----------- Exportálás -----------
module.exports = router
