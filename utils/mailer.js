const transporter = require('../config/mailer')
const jwt = require('jsonwebtoken')
const env = require('dotenv').config()

const sendEmailVerification = async (user, newEmail, oldEmail) => {
    const token = jwt.sign({ userId: user.id, newEmail, oldEmail }, process.env.EMAIL_SECRET, { expiresIn: '10m' })

    const domain = env.parsed.NODE_ENV === 'prod' ? env.parsed.DOMAIN_PROD : env.parsed.DOMAIN_DEV

    const verificationUrl = `${domain}/account/change-email/${token}`

    // 👉 Email az új címre – megerősítés
    await transporter.sendMail({
        from: '"WebNotes" <no-reply@webnotes.hu>',
        to: newEmail,
        subject: '📩 WebNotes – Email cím megerősítése',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 30px;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
              <h2 style="color: #206bc4;">📩 Email cím megerősítése</h2>
              <p>Szia <strong>${user.username}</strong>!</p>
              <p>A <strong>WebNotes</strong> fiókodhoz email cím módosítást kezdeményeztél.</p>
              <p>Kérlek kattints az alábbi gombra a megerősítéshez:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background-color: #206bc4; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">✅ Email megerősítése</a>
              </div>
              <p style="font-size: 14px; color: #555;">Ha nem te voltál, hagyd figyelmen kívül ezt az üzenetet.</p>
              <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #888;">Ez az üzenet automatikusan generálódott – kérlek ne válaszolj rá.</p>
            </div>
          </div>
        `,
    })

    // 👉 Értesítés a régi email címre (opcionális, de biztonságos)
    if (oldEmail) {
        await transporter.sendMail({
            from: '"WebNotes" <no-reply@webnotes.hu>',
            to: oldEmail,
            subject: '⚠️ WebNotes – Email módosítás kezdeményezve',
            html: `
              <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 30px;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                  <h2 style="color: #206bc4;">⚠️ Email módosítási kísérlet</h2>
                  <p>Szia <strong>${user.username}</strong>!</p>
                  <p>Valaki módosítani próbálta a WebNotes fiókod email címét erre: <strong>${newEmail}</strong>.</p>
                  <p>Ha te voltál, nincs teendőd a megerősítésig.</p>
                  <p>Ha nem te voltál, kérlek <strong>változtasd meg a jelszavad</strong> minél hamarabb!</p>
                  <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
                  <p style="font-size: 12px; color: #888;">Ez az üzenet automatikusan generálódott – kérlek ne válaszolj rá.</p>
                </div>
              </div>
            `,
        })
    }
}

const send6DigitCode = async (user, email, digits) => {
    await transporter.sendMail({
        from: '"WebNotes" <no-reply@webnotes.hu>',
        to: email,
        subject: '🔐 WebNotes – Email módosítás jóváhagyása',
        html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h2 style="color: #206bc4;">🔐 Email módosítási kód</h2>
          <p>Szia <strong>${user.username}</strong>!</p>
          <p>A <strong>WebNotes</strong> fiókod email címének módosítását kezdeményezted.</p>
          <p>A folytatáshoz használd az alábbi <strong>6 számjegyű kódot</strong> az űrlapon:</p>
  
          <div style="text-align: center; margin: 30px 25px;">
            <div style="display: inline-block; font-size: 28px; letter-spacing: 12px; font-weight: bold; background-color: #f1f3f5; color: #206bc4; padding: 12px 24px; border-radius: 8px;">
              ${digits}
            </div>
          </div>
  
          <p style="font-size: 15px; color: #555;">⏳ A kód <strong>10 percen belül</strong> lejár biztonsági okokból.</p>
          <p style="font-size: 14px; color: #d63939;">❗ Ha nem te kezdeményezted, javasoljuk, hogy azonnal módosítsd a jelszavad!</p>
  
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #888;">Ez az üzenet automatikusan generálódott – kérlek ne válaszolj rá.</p>
        </div>
      </div>
    `,
    })
}

const passwordChangedNotification = async (user) => {
    await transporter.sendMail({
        from: '"WebNotes" <no-reply@webnotes.hu>',
        to: user.email,
        subject: '🔐 WebNotes – Jelszavad megváltozott',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 30px;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
              <h2 style="color: #206bc4;">🔐 Jelszó módosítás történt</h2>
              <p>Szia <strong>${user.username}</strong>!</p>
              <p>A WebNotes fiókodhoz tartozó jelszót <strong>nemrég megváltoztatták</strong>.</p>
              <p>Ha te végezted a módosítást, nincs teendőd.</p>
              <p style="color: #d63939; font-weight: bold; margin-top: 20px;">
                Ha nem te voltál, kérlek azonnal állítsd vissza a jelszavad vagy vedd fel velünk a kapcsolatot!
              </p>
              <div style="margin-top: 30px;">
                <a href="https://webnotes.hu/reset-password" style="display: inline-block; background-color: #206bc4; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
                  🔁 Jelszó visszaállítása
                </a>
              </div>
              <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #888;">Ez az üzenet automatikusan generálódott – kérlek ne válaszolj rá.</p>
            </div>
          </div>
        `,
    })
}

const resetPasswordMail = async (user) => {
    const token = jwt.sign({ userId: user.id }, process.env.EMAIL_SECRET, {
        expiresIn: '1h',
    })

    const domain = env.parsed.NODE_ENV === 'prod' ? env.parsed.DOMAIN_PROD : env.parsed.DOMAIN_DEV

    const resetUrl = `${domain}/reset-password/${token}`

    await transporter.sendMail({
        from: '"WebNotes" <no-reply@webnotes.hu>',
        to: user.email,
        subject: '🔑 WebNotes – Jelszó visszaállítása',
        html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h2 style="color: #206bc4;">🔑 Jelszó visszaállítása</h2>
          <p>Szia <strong>${user.username}</strong>!</p>
          <p>Úgy tűnik, hogy elfelejtetted a <strong>WebNotes</strong> fiókod jelszavát.</p>
          <p>Kattints az alábbi gombra, hogy új jelszót állíthass be:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #206bc4; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">🔄 Jelszó visszaállítása</a>
          </div>
          <p style="font-size: 14px; color: #555;">Ha nem te kérted a jelszó visszaállítást, nyugodtan hagyd figyelmen kívül ezt az üzenetet.</p>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #888;">Ez egy automatikus üzenet – kérlek ne válaszolj rá.</p>
        </div>
      </div>
    `,
    })
}

module.exports = {
    sendEmailVerification,
    passwordChangedNotification,
    send6DigitCode,
    resetPasswordMail,
}
