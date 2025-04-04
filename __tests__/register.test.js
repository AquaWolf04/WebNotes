const request = require('supertest')
const app = require('../server')

describe('POST /register HTML-nézetből kiolvasott CSRF tokennel', () => {
    let csrfToken = ''
    let cookies = []

    beforeEach(async () => {
        const res = await request(app).get('/register') // ez a form oldal

        // 1️⃣ Sütik mentése
        cookies = res.headers['set-cookie']

        // 2️⃣ CSRF token kinyerése <meta> tagből
        const match = res.text.match(/<meta name="csrf-token" content="(.+?)"/)
        csrfToken = match ? match[1] : null
        expect(csrfToken).not.toBeNull() // megelőző ellenőrzés
    })

    it('sikeres regisztráció', async () => {
        const res = await request(app)
            .post('/register')
            .set('Cookie', cookies)
            .set('X-CSRF-Token', csrfToken) // FONTOS: ez egyezik a frontendeddel
            .send({
                username: 'tessttuser',
                email: 'tessts@example.com',
                create_password: 'securePass123!*',
                confirm_password: 'securePass123!*',
            })

        console.log('RESPONSE:', res.statusCode, res.body)

        expect(res.statusCode).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.redirect).toBe('/')
    })
})
