const transporter = require('../config/mailer')
const jwt = require('jsonwebtoken')

const sendEmailVerification = async (user, newEmail, oldEmail) => {
    const token = jwt.sign(
        { userId: user.id, newEmail },
        process.env.EMAIL_SECRET,
        { expiresIn: '10m' }
    )

    const verificationUrl = `https://webnotes.hu/account/confirm-email-change?token=${token}`

    // 👉 Email az új címre – megerősítés
    await transporter.sendMail({
        from: '"WebNotes" <no-reply@webnotes.hu>',
        to: newEmail,
        subject: 'Email cím megerősítése',
        html: `
      <p>Szia ${user.username}!</p>
      <p>Az email címed módosítását kezdeményezted a WebNotes fiókodban.</p>
      <p>Kattints az alábbi gombra a megerősítéshez:</p>
      <p><a href="${verificationUrl}" style="padding: 10px 20px; background-color: #206bc4; color: #fff; border-radius: 6px; text-decoration: none;">Email megerősítése</a></p>
      <p>Ha nem te kezdeményezted, hagyd figyelmen kívül ezt az emailt.</p>
    `,
    })

    // 👉 Értesítés a régi email címre (opcionális, de biztonságos)
    if (oldEmail) {
        await transporter.sendMail({
            from: '"WebNotes" <no-reply@webnotes.hu>',
            to: oldEmail,
            subject: 'Email cím módosítás kezdeményezve',
            html: `
        <p>Szia ${user.username}!</p>
        <p>Valaki megpróbálta módosítani a fiókod email címét erre: <strong>${newEmail}</strong></p>
        <p>Ha te voltál, nincs további teendőd, amíg nem kattintasz a megerősítő linkre az új emailben.</p>
        <p>Ha nem te voltál, kérlek változtasd meg jelszavadat!</p>
      `,
        })
    }
}

module.exports = {
    sendEmailVerification,
}
