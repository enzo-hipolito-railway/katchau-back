const { DataTypes } = require('sequelize')
const db = require('../config/db')

const Categoria = db.define('categorias', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING(80),
        allowNull: false,
        unique: true
    },
    descricao: {
        type: DataTypes.TEXT
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'categorias'
})

module.exports = Categoria
