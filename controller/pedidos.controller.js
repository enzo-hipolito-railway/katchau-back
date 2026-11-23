const { Pedido, ItemPedido, Entrega } = require('../models')
const checkoutService = require('../services/checkout.service')

const responderErroCheckout = (res, err) => {
    if(err instanceof checkoutService.CheckoutError){
        return res.status(err.status).json({message: err.message})
    }

    console.error('Erro no checkout', err)
    return res.status(500).json({message: 'Falha ao processar o pedido.'})
}

const cadastrar = async (req, res) => {
    if(req.body.desconto !== undefined || req.body.total !== undefined || req.body.subtotal !== undefined){
        return res.status(400).json({message: 'Valores do pedido sao calculados pelo servidor. Envie cupom_codigo para usar um cupom.'})
    }
    try{
        const pedido = await checkoutService.criarCheckout({
            usuarioId: req.user.id || req.user.sub,
            itens: req.body.itens,
            cupomCodigo: req.body.cupom_codigo,
            enderecoId: req.body.endereco_id
        })

        res.status(201).json({message: 'Checkout criado com sucesso!', pedido})
    }
    catch(err){
        responderErroCheckout(res, err)
    }
}

const confirmar = async (req, res) => {
    try{
        const pedido = await checkoutService.confirmarPedido(req.params.id)

        res.status(200).json({message: 'Pedido confirmado e estoque atualizado com sucesso!', pedido})
    }
    catch(err){
        responderErroCheckout(res, err)
    }
}

const concluir = async (req, res) => {
    try{
        const pedido = await checkoutService.concluirPedido(req.params.id)

        res.status(200).json({message: 'Pedido concluido com sucesso!', pedido})
    }
    catch(err){
        responderErroCheckout(res, err)
    }
}

const cancelar = async (req, res) => {
    try{
        const pedido = await checkoutService.cancelarPedido(
            req.params.id,
            req.user.id,
            req.user.perfil === 'ADMIN'
        )
        return res.status(200).json({message: 'Pedido cancelado com sucesso!', pedido})
    }catch(err){
        return responderErroCheckout(res, err)
    }
}

const listar = async (req, res) => {
    try{
        const pedidos = await Pedido.findAll({include: [{model: ItemPedido, as: 'itens'}, {model: Entrega, as: 'entrega'}]})

        res.status(200).json({pedidos})
    }
    catch(err){
        console.error('Erro ao listar pedidos', err)
        res.status(500).json({message: 'Falha ao listar pedidos.'})
    }
}

const meusPedidos = async (req, res) => {
    try{
        const pedidos = await Pedido.findAll({
            where: {usuario_id: req.user.id || req.user.sub},
            include: [{model: ItemPedido, as: 'itens'}, {model: Entrega, as: 'entrega'}],
            order: [['data_pedido', 'DESC']]
        })
        return res.status(200).json({pedidos})
    }catch(err){
        console.error('Erro ao listar pedidos do usuario', err)
        return res.status(500).json({message: 'Falha ao listar pedidos.'})
    }
}

const consultar = async (req, res) => {
    const id = req.params.id
    const userId = req.user.id || req.user.sub

    try{
        
        const pedido = await Pedido.findByPk(id, {
            include: [{model: ItemPedido, as: 'itens'}, {model: Entrega, as: 'entrega'}]
        })

        
        if(!pedido){
            return res.status(404).json({message: `O Pedido com id ${id} nao existe!`})
        }
        
        if(userId !== pedido.usuario_id && req.user.perfil !== 'ADMIN'){
            return res.status(403).json({message: "Você não pode consultar pedidos dessa conta!"})
        }

        res.status(200).json({pedido})
    }
    catch(err){
        console.error('Erro ao consultar pedido', err)
        res.status(500).json({message: 'Falha ao consultar pedido.'})
    }
}

module.exports = { cadastrar, confirmar, concluir, cancelar, listar, meusPedidos, consultar }
