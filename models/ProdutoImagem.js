const { DataTypes } = require('sequelize')
const db = require('../config/db')

const ProdutoImagem = db.define('produto_imagens', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    produto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'produtos',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    url: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
            isUrl: true
        }
    },
    ordem: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    }
}, {
    timestamps: true,
    tableName: 'produto_imagens'
})

module.exports = ProdutoImagem
