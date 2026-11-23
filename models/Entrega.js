const { DataTypes } = require('sequelize')
const db = require('../config/db')

const Entrega = db.define('entregas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pedido_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'pedidos',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    status: {
        type: DataTypes.ENUM('PREPARANDO', 'ENVIADO', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADO'),
        allowNull: false,
        defaultValue: 'PREPARANDO'
    },
    codigo_rastreio: {
        type: DataTypes.STRING(80)
    },
    previsao_entrega: {
        type: DataTypes.DATEONLY
    },
    data_entrega: {
        type: DataTypes.DATE
    },
    endereco_completo: {
        type: DataTypes.STRING(500),
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: 'entregas'
})

module.exports = Entrega
