const mysql = require('mysql2/promise')
const config = require('./config')
const logger = require('../utils/logger')

const pool = mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})

const connectDB = async (query, values = []) => {
    if (!query) {
        logger.error('SQL hiba: üres lekérdezés!')
        return [1, new Error('Üres SQL lekérdezés!')]
    }

    try {
        const connection = await pool.getConnection()
        try {
            const [result] = await connection.execute(query, values)
            connection.release()
            logger.info(`Query OK: ${query}`)
            return [0, result]
        } catch (queryError) {
            logger.error(`Query Error: ${queryError.message}`)
            connection.release()
            return [1, queryError]
        }
    } catch (connectionError) {
        logger.error(`Database Connection Error: ${connectionError.message}`)
        return [1, connectionError]
    }
}

module.exports = connectDB
