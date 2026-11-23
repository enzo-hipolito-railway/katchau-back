const Usuario = require('./Usuario')
const Endereco = require('./Endereco')
const Categoria = require('./Categoria')
const Cupom = require('./Cupom')
const Produto = require('./Produto')
const ProdutoImagem = require('./ProdutoImagem')
const Estoque = require('./Estoque')
const Pedido = require('./Pedido')
const ItemPedido = require('./ItemPedido')
const Entrega = require('./Entrega')
const Avaliacao = require('./Avaliacao')

Usuario.hasMany(Endereco, {
    foreignKey: {
        name: 'idUsuario',
        allowNull: false
    },
    as: 'enderecos',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
Endereco.belongsTo(Usuario, {
    foreignKey: {
        name: 'idUsuario',
        allowNull: false
    },
    as: 'usuario',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

Categoria.hasMany(Produto, {
    foreignKey: {
        name: 'categoria_id',
        allowNull: false
    },
    as: 'produtos',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})
Produto.belongsTo(Categoria, {
    foreignKey: {
        name: 'categoria_id',
        allowNull: false
    },
    as: 'categoria',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})

Cupom.hasMany(Pedido, {
    foreignKey: {name: 'cupom_id', allowNull: true},
    as: 'pedidos',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})
Pedido.belongsTo(Cupom, {
    foreignKey: {name: 'cupom_id', allowNull: true},
    as: 'cupom',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})

Produto.hasMany(ProdutoImagem, {
    foreignKey: {
        name: 'produto_id',
        allowNull: false
    },
    as: 'imagens',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
ProdutoImagem.belongsTo(Produto, {
    foreignKey: {
        name: 'produto_id',
        allowNull: false
    },
    as: 'produto',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

Produto.hasOne(Estoque, {
    foreignKey: {
        name: 'produto_id',
        allowNull: false,
        unique: true
    },
    as: 'estoque',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
Estoque.belongsTo(Produto, {
    foreignKey: {
        name: 'produto_id',
        allowNull: false,
        unique: true
    },
    as: 'produto',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

Usuario.hasMany(Pedido, {
    foreignKey: {
        name: 'usuario_id',
        allowNull: false
    },
    as: 'pedidos',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})
Pedido.belongsTo(Usuario, {
    foreignKey: {
        name: 'usuario_id',
        allowNull: false
    },
    as: 'usuario',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})

Pedido.hasMany(ItemPedido, {
    foreignKey: {
        name: 'pedido_id',
        allowNull: false
    },
    as: 'itens',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
ItemPedido.belongsTo(Pedido, {
    foreignKey: {
        name: 'pedido_id',
        allowNull: false
    },
    as: 'pedido',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

Produto.hasMany(ItemPedido, {
    foreignKey: {
        name: 'produto_id',
        allowNull: false
    },
    as: 'itensPedido',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})
ItemPedido.belongsTo(Produto, {
    foreignKey: {
        name: 'produto_id',
        allowNull: false
    },
    as: 'produto',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})

Pedido.hasOne(Entrega, {
    foreignKey: {
        name: 'pedido_id',
        allowNull: false,
        unique: true
    },
    as: 'entrega',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
Entrega.belongsTo(Pedido, {
    foreignKey: {
        name: 'pedido_id',
        allowNull: false,
        unique: true
    },
    as: 'pedido',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

Produto.hasMany(Avaliacao, {
    foreignKey: {name: 'produto_id', allowNull: false},
    as: 'avaliacoes',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
Avaliacao.belongsTo(Produto, {
    foreignKey: {name: 'produto_id', allowNull: false},
    as: 'produto',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

Usuario.hasMany(Avaliacao, {
    foreignKey: {name: 'usuario_id', allowNull: false},
    as: 'avaliacoes',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
Avaliacao.belongsTo(Usuario, {
    foreignKey: {name: 'usuario_id', allowNull: false},
    as: 'usuario',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})

module.exports = {
    Usuario,
    Endereco,
    Categoria,
    Cupom,
    Produto,
    ProdutoImagem,
    Estoque,
    Pedido,
    ItemPedido,
    Entrega,
    Avaliacao
}