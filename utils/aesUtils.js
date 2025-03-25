const crypto = require('crypto')

const algorithm = 'aes-256-cbc'
const key = crypto.scryptSync(process.env.AES_SECRET_KEY, 'salt', 32) // 32 bájtos kulcs

function encryptJSON(jsonObject) {
    const iv = crypto.randomBytes(16)
    const jsonString = JSON.stringify(jsonObject)

    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(jsonString, 'utf-8', 'hex')
    encrypted += cipher.final('hex')

    return {
        iv: iv.toString('hex'),
        content: encrypted,
    }
}

function decryptJSON(encryptedData) {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(encryptedData.iv, 'hex'))

    let decrypted = decipher.update(encryptedData.content, 'hex', 'utf-8')
    decrypted += decipher.final('utf-8')

    return JSON.parse(decrypted)
}

module.exports = { encryptJSON, decryptJSON }
