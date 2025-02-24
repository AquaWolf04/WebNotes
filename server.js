const express = require('express')
const dotenv = require('dotenv').config()
const cors = require('cors')
const csrf = require('csurf')
const router = require('./routes/web')
const session = require('express-session')
const cookieParser = require('cookie-parser')

const app = express()

app.use(cookieParser())

const port = process.env.PORT || 3000

app.use(express.static('assets'))

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
)

app.set('view engine', 'ejs')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const csrfProtection = csrf({ cookie: true })
app.use(csrfProtection)

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken()
    next()
})

app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
            error: [{ msg: 'A CSRF token nem érvényes! Frissítsd az oldalt és próbáld újra.' }],
        })
    }
    next(err)
})

app.use('/', router)

app.listen(port, () => {
    console.log(`🚀 | A szerver fut a http://localhost:${port} címen!`)
})
