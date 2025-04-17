const request = require('supertest')
const app = require('../server')

describe('POST /register HTML-nézetből kiolvasott CSRF tokennel', () => {
    let csrfToken = ''
    let cookies = []

    beforeEach(async () => {
        const res = await request(app).get('/register')

        cookies = res.headers['set-cookie']

        const match = res.text.match(/<meta name="csrf-token" content="(.+?)"/)
        csrfToken = match ? match[1] : null
        expect(csrfToken).not.toBeNull()
    })

    it('sikeres regisztráció', async () => {
        const uniqueSuffix = Date.now() // vagy Math.random()
        const res = await request(app)
            .post('/register')
            .set('Cookie', cookies)
            .set('X-CSRF-Token', csrfToken)
            .send({
                username: `testuser_${uniqueSuffix}`,
                email: `test_${uniqueSuffix}@example.com`,
                create_password: 'SecuredPassword12!*',
                confirm_password: 'SecuredPassword12!*',
            })

        expect(res.statusCode).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.redirect).toBe('/')
    })
})

describe('POST /register HTML-nézetből kiolvasott CSRF tokennel', () => {
    let csrfToken = ''
    let cookies = []

    beforeEach(async () => {
        const res = await request(app).get('/register')

        cookies = res.headers['set-cookie']

        const match = res.text.match(/<meta name="csrf-token" content="(.+?)"/)
        csrfToken = match ? match[1] : null
        expect(csrfToken).not.toBeNull()
    })

    it('sikertelen regisztráció', async () => {
        const uniqueSuffix = Date.now() // vagy Math.random()
        const res = await request(app)
            .post('/register')
            .set('Cookie', cookies)
            .set('X-CSRF-Token', csrfToken)
            .send({
                username: `testuser_${uniqueSuffix}`,
                email: `test_${uniqueSuffix}@example.com`,
                create_password: '1234!@#$',
                confirm_password: '1234!@#$',
            })

        expect(res.statusCode).toBe(400)
        const errorMessages = res.body.errors.map((e) => e.msg)

        expect(errorMessages).toContain(
            'A jelszónak tartalmaznia kell nagybetűt.'
        )
    })
})
