const { DataTypes } = require('sequelize')
const db = require('../config/db')

const Usuario = db.define('usuarios', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome:{
        type: DataTypes.STRING(120),
        allowNull: false
    },
    email:{
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true
    },
    senha_hash:{
        type: DataTypes.STRING(255),
        allowNull: false
    },
    cpf:{
        type: DataTypes.STRING(11),
        allowNull: false,
        unique: true
    },
    perfil:{
        type: DataTypes.ENUM('ADMIN', 'CLIENTE'),
        allowNull: false,
        defaultValue: 'CLIENTE'
    }
},{
    timestamps: true,
    tableName: 'usuarios'
})

module.exports = Usuario;
