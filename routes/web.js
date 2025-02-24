const express = require('express')
const router = express.Router()
const csrf = require('csurf')
const csrfProtection = csrf({ cookie: true })

const { register, validateRegister } = require('../controllers/RegisterController.js')
const lcontroller = require('../controllers/LoginController.js')
const ncontroller = require('../controllers/NotesController.js')

// ######## GET kérések ########

router.get('/', (req, res) => {
    if (req.session && req.session.user) {
        res.render('index', {
            user: req.session.user,
        })
    } else {
        let session_info = req.session.message
        delete req.session.message
        res.render('login', {
            status: session_info,
        })
    }
})

router.get('/notes/list', ncontroller.list)

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/register', (req, res) => {
    let session_info = req.session.message
    delete req.session.message
    res.render('register', {
        status: session_info,
    })
})

router.get('/logout', lcontroller.logout)

// ######## POST kérések ########

router.post('/login', lcontroller.login)

router.post('/register', csrfProtection, validateRegister, register)

router.post('/notes/save', ncontroller.save)

module.exports = router
