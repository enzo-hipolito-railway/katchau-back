const { ItemPedido } = require('../models')

const listar = async (req, res) => {
    try{
        const itensPedido = await ItemPedido.findAll()
        return res.status(200).json({itensPedido})
    }catch(err){
        console.error('Erro ao listar itens do pedido', err)
        return res.status(500).json({message: 'Falha ao listar itens do pedido.'})
    }
}

const consultar = async (req, res) => {
    try{
        const itemPedido = await ItemPedido.findByPk(req.params.id)
        if(!itemPedido) return res.status(404).json({message: 'Item do pedido nao encontrado.'})
        return res.status(200).json({itemPedido})
    }catch(err){
        console.error('Erro ao consultar item do pedido', err)
        return res.status(500).json({message: 'Falha ao consultar item do pedido.'})
    }
}

module.exports = { listar, consultar }
