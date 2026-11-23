require('dotenv').config()
const { Sequelize } = require('sequelize')

const db = new Sequelize(
        process.env.DB_NAME || 'katchau_db',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || 'root',
        {
            host: process.env.DB_HOST || 'localhost',
            dialect: 'mysql',
            port: Number(process.env.DB_PORT || 3306)
        }
    )

module.exports = db 