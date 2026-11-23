const { DataTypes } = require('sequelize')
const db = require('../config/db')

const Cupom = db.define('cupons', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigo: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true
    },
    percentual: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: {min: 0.01, max: 100}
    },
    limite_usos: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        validate: {min: 1}
    },
    usos_realizados: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
    },
    expira_em: {
        type: DataTypes.DATE,
        allowNull: true
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'cupons'
})

module.exports = Cupom
