require('dotenv').config()

module.exports = {
    development: {
        username: process.env.DB_USER, // USER helyett inkább DB_USER legyen az .env-ben
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        dialect: process.env.DIALECT || 'mysql', // Ha nincs beállítva, alapértelmezettként MySQL
        logging: false, // Elkerüli a felesleges logokat
    },
}
