const { DataTypes } = require('sequelize')
const db = require('../config/db')

const Estoque = db.define('estoques', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    produto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'produtos',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    quantidade_minima: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    ultima_movimentacao: {
        type: DataTypes.DATE
    }
}, {
    timestamps: true,
    tableName: 'estoques'
})

module.exports = Estoque
