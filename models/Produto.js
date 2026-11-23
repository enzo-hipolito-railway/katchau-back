const { DataTypes } = require('sequelize')
const db = require('../config/db')

const Produtos = db.define('produtos', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigo:{
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true
    },
    nome:{
        type: DataTypes.STRING(150),
        allowNull: false
    },
    descricao:{
        type: DataTypes.TEXT,
        allowNull: false
    },
    preco:{
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    ativo:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    categoria_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categorias',
            key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    },
},{
    timestamps: true,
    tableName: 'produtos'
})

module.exports = Produtos;
