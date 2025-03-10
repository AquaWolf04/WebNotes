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
const port = process.env.PORT || 3000

app.use(cookieParser())
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
            secure: process.env.NODE_ENV === 'production' ? true : false,
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 1,
        },
    })
)

// Csak fejlesztési környezetben szinkronizáljuk
if (process.env.NODE_ENV !== 'production') {
    sessionStore.sync()
}

app.set('view engine', 'ejs')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// ✅ CSRF csak a nem-API kérésekre
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return next()
    }
    csrf({ cookie: true })(req, res, next)
})

// ✅ CSRF token beállítása a nézetekhez
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken ? req.csrfToken() : ''
    next()
})

// ✅ Session üzenetek törlése
app.use((req, res, next) => {
    if (req.session && req.session.message) {
        console.log('✅ Session üzenet törlése:', req.session.message)
        delete req.session.message
    }
    next()
})

// ✅ Adatbázis kapcsolat inicializálása
const initDB = async () => {
    try {
        await sequelize.authenticate()
        console.log('✅ | Kapcsolat az adatbázishoz sikeresen létrejött!')
    } catch (error) {
        console.error('❌ | Hiba az adatbázishoz való kapcsolódáskor:', error)
    }
}

initDB()

// ✅ Router beállítása
app.use('/', router)

// ✅ Hibakezelő middleware
app.use((req, res, next) => {
    res.status(404).render('404', { url: req.originalUrl })
})

app.use((err, req, res, next) => {
    console.error('❌ Szerverhiba:', err)
    res.status(500).json({ error: 'Belső szerverhiba történt' })
})

app.listen(port, () => {
    console.log(`🚀 | A szerver fut a http://localhost:${port} címen!`)
})
