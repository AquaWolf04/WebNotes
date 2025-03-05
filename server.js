const express = require('express')
const dotenv = require('dotenv').config()
const cors = require('cors')
const csrf = require('csurf')
const router = require('./routes/web')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const { sequelize } = require('./app/models')
const SequelizeStore = require('connect-session-sequelize')(session.Store)

const app = express()

app.use(cookieParser())

const port = process.env.PORT || 3000

app.use(express.static('assets'))

const sessionStore = new SequelizeStore({
    db: sequelize,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 24 * 60 * 60 * 1000,
})

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 1,
        },
    })
)

sessionStore.sync()

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

app.use((req, res, next) => {
    if (req.session && req.session.message) {
        console.log('✅ Session üzenet törlése:', req.session.message)
        delete req.session.message
    }
    next()
})

const initDB = async () => {
    try {
        await sequelize.authenticate()
        console.log('✅ | Kapcsolat az adatbázishoz sikeresen létrejött!')
    } catch (error) {
        console.error('❌ | Hiba az adatbázishoz való kapcsolódáskor:', error)
    }
}

initDB()

app.use('/', router)

app.listen(port, () => {
    console.log(`🚀 | A szerver fut a http://localhost:${port} címen!`)
})
