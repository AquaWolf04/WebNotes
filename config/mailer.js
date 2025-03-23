const nodemailer = require('nodemailer')
require('dotenv').config() // ha még nincs a projekt elején meghívva

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true', // .env-ben string az érték
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

module.exports = transporter
