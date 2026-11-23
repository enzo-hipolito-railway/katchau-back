const { DataTypes } = require('sequelize')
const db = require('../config/db')

const Endereco = db.define('enderecos', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idUsuario:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: "usuarios",
            key: "id"
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    cep:{
        type: DataTypes.STRING(8),
        allowNull: false
    },
    rua:{
        type: DataTypes.STRING(70),
        allowNull: false
    },
    numero:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    complemento:{
        type: DataTypes.STRING(30),
        allowNull: true
    },
    bairro:{
        type: DataTypes.STRING(30),
        allowNull: false
    },
    cidade:{
        type: DataTypes.STRING(30),
        allowNull: false
    },
    uf:{
        type: DataTypes.STRING(2),
        allowNull: false
    }
},{
    timestamps: true,
    tableName: 'enderecos'
})

module.exports = Endereco;
