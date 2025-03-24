const transporter = require('../config/mailer')
const jwt = require('jsonwebtoken')

const sendEmailVerification = async (user, newEmail, oldEmail) => {
    const token = jwt.sign({ userId: user.id, newEmail, oldEmail }, process.env.EMAIL_SECRET, { expiresIn: '10m' })

    const verificationUrl = `https://webnotes.hu/account/confirm-email-change/${token}`

    // 👉 Email az új címre – megerősítés
    await transporter.sendMail({
        from: '"WebNotes" <no-reply@webnotes.hu>',
        to: newEmail,
        subject: 'Email cím megerősítése',
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 30px;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h2 style="color: #206bc4; margin-bottom: 20px;">Email cím megerősítése</h2>
            <p style="font-size: 16px; color: #333;">Szia <strong>${user.username}</strong>!</p>
            <p style="font-size: 16px; color: #333;">Az email címed módosítását kezdeményezted a <strong>WebNotes</strong> fiókodban.</p>
            <p style="font-size: 16px; color: #333;">Kattints az alábbi gombra a megerősítéshez:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #206bc4; color: #fff; text-decoration: none; border-radius: 6px; font-size: 16px;">Email megerősítése</a>
            </div>
            <p style="font-size: 14px; color: #666;">Ha nem te kezdeményezted, hagyd figyelmen kívül ezt az emailt.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999; text-align: center;">© 2025 WebNotes • <a href="https://webnotes.hu" style="color: #999; text-decoration: none;">webnotes.hu</a></p>
            </div>
        </div>
        `,
    })

    // 👉 Értesítés a régi email címre (opcionális, de biztonságos)
    if (oldEmail) {
        await transporter.sendMail({
            from: '"WebNotes" <no-reply@webnotes.hu>',
            to: oldEmail,
            subject: 'Email cím módosítás kezdeményezve',
            html: `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 30px;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h2 style="color: #206bc4; margin-bottom: 20px;">Figyelmeztetés: Email módosítási kísérlet</h2>
                <p style="font-size: 16px; color: #333;">Szia <strong>${user.username}</strong>!</p>
                <p style="font-size: 16px; color: #333;">Valaki megpróbálta módosítani a fiókod email címét erre: <strong>${newEmail}</strong></p>
                <p style="font-size: 16px; color: #333;">Ha te voltál, nincs további teendőd, amíg nem kattintasz a megerősítő linkre az új emailben.</p>
                <p style="font-size: 16px; color: #333;">Ha nem te voltál, kérlek <strong>változtasd meg a jelszavadat</strong> a biztonságod érdekében!</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #999; text-align: center;">© 2025 WebNotes • <a href="https://webnotes.hu" style="color: #999; text-decoration: none;">webnotes.hu</a></p>
                </div>
            </div>
            `,
        })
    }
}

module.exports = {
    sendEmailVerification,
}
