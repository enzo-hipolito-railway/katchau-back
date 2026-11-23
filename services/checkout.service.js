const { randomUUID } = require('crypto')
const { Op } = require('sequelize')
const db = require('../config/db')
const { Pedido, ItemPedido, Produto, Estoque, Cupom, Entrega, Categoria, Endereco } = require('../models')
const { formatarEndereco } = require('./endereco.service')

class CheckoutError extends Error {
    constructor(message, status = 400){
        super(message)
        this.status = status
    }
}

const centavos = (valor) => Math.round(Number(valor) * 100)

const validarCupom = (cupom, subtotal) => {
    if(!cupom) throw new CheckoutError('Cupom nao encontrado.', 404)
    const agora = new Date()
    if(!cupom.ativo || (cupom.expira_em && agora >= new Date(cupom.expira_em))){
        throw new CheckoutError('Cupom indisponivel ou fora da validade.', 409)
    }
    if(cupom.limite_usos !== null && cupom.usos_realizados >= cupom.limite_usos){
        throw new CheckoutError('Cupom esgotado.', 409)
    }
    const percentualCentesimos = Math.round(Number(cupom.percentual) * 100)
    return Math.round(centavos(subtotal) * percentualCentesimos / 10000) / 100
}

const normalizarItens = (itens) => {
    if(!Array.isArray(itens) || itens.length === 0){
        throw new CheckoutError('Informe ao menos um produto no campo itens.')
    }

    const itensAgrupados = new Map()

    for(const item of itens){
        if(!item || typeof item !== 'object'){
            throw new CheckoutError('Cada item deve conter produto_id e quantidade.')
        }
        const produtoId = Number(item.produto_id)
        const quantidade = Number(item.quantidade)

        if(!Number.isSafeInteger(produtoId) || produtoId <= 0){
            throw new CheckoutError('Todos os itens precisam de um produto_id valido.')
        }

        if(!Number.isSafeInteger(quantidade) || quantidade <= 0){
            throw new CheckoutError('A quantidade de cada item deve ser um inteiro maior que zero.')
        }

        const quantidadeAgrupada = (itensAgrupados.get(produtoId) || 0) + quantidade
        if(!Number.isSafeInteger(quantidadeAgrupada)) throw new CheckoutError('Quantidade total de itens invalida.')
        itensAgrupados.set(produtoId, quantidadeAgrupada)
    }

    return [...itensAgrupados]
        .map(([produto_id, quantidade]) => ({produto_id, quantidade}))
        .sort((itemA, itemB) => itemA.produto_id - itemB.produto_id)
}

const criarCheckout = async ({usuarioId, itens, cupomCodigo, enderecoId}) => {
    if(!usuarioId){
        throw new CheckoutError('Usuario nao autenticado.', 401)
    }

    const itensNormalizados = normalizarItens(itens)
    const idEndereco = Number(enderecoId)
    if(!Number.isSafeInteger(idEndereco) || idEndereco <= 0){
        throw new CheckoutError('Informe um endereco_id valido.')
    }
    if(cupomCodigo !== undefined && (typeof cupomCodigo !== 'string' || !cupomCodigo.trim())){
        throw new CheckoutError('Informe um codigo de cupom valido.')
    }

    return db.transaction(async (transaction) => {
        const endereco = await Endereco.findOne({
            where: {id: idEndereco, idUsuario: usuarioId},
            transaction
        })
        if(!endereco) throw new CheckoutError('Endereco nao encontrado para este usuario.', 404)

        const idsProdutos = itensNormalizados.map(item => item.produto_id)
        const produtos = await Produto.findAll({
            where: {
                id: {[Op.in]: idsProdutos},
                ativo: true
            },
            include: [{model: Categoria, as: 'categoria', where: {ativo: true}, required: true}],
            transaction
        })

        if(produtos.length !== idsProdutos.length){
            throw new CheckoutError('Um ou mais produtos nao existem ou estao inativos.', 404)
        }

        const produtosPorId = new Map(produtos.map(produto => [produto.id, produto]))
        const estoques = await Estoque.findAll({
            where: {produto_id: {[Op.in]: idsProdutos}},
            transaction
        })
        const estoquesPorProduto = new Map(estoques.map(estoque => [estoque.produto_id, estoque]))

        for(const item of itensNormalizados){
            const estoque = estoquesPorProduto.get(item.produto_id)

            if(!estoque){
                throw new CheckoutError(`Nao existe estoque cadastrado para o produto ${item.produto_id}.`, 409)
            }

            if(estoque.quantidade < item.quantidade){
                throw new CheckoutError(
                    `Estoque insuficiente para o produto ${item.produto_id}. Disponivel: ${estoque.quantidade}.`,
                    409
                )
            }
        }

        const itensDoPedido = itensNormalizados.map(item => {
            const produto = produtosPorId.get(item.produto_id)
            const precoUnitario = centavos(produto.preco) / 100

            return {
                ...item,
                preco_unitario: precoUnitario,
                subtotal: centavos(produto.preco) * item.quantidade / 100
            }
        })

        const subtotalCentavos = itensDoPedido.reduce((total, item) => total + centavos(item.subtotal), 0)
        if(!Number.isSafeInteger(subtotalCentavos) || subtotalCentavos > 9999999999){
            throw new CheckoutError('O subtotal do pedido excede o valor permitido.')
        }
        const subtotal = subtotalCentavos / 100

        let cupom = null
        let desconto = 0
        if(cupomCodigo !== undefined){
            cupom = await Cupom.findOne({where: {codigo: cupomCodigo.trim().toUpperCase()}, transaction})
            desconto = validarCupom(cupom, subtotal)
        }

        const pedido = await Pedido.create({
            codigo: `PED-${randomUUID()}`,
            usuario_id: usuarioId,
            cupom_id: cupom?.id || null,
            endereco_entrega: formatarEndereco(endereco),
            status: 'PENDENTE',
            subtotal,
            desconto,
            total: (subtotalCentavos - centavos(desconto)) / 100
        }, {transaction})

        await ItemPedido.bulkCreate(
            itensDoPedido.map(item => ({...item, pedido_id: pedido.id})),
            {transaction}
        )

        return Pedido.findByPk(pedido.id, {
            include: [{model: ItemPedido, as: 'itens'}],
            transaction
        })
    })
}

const confirmarPedido = async (pedidoId) => {
    return db.transaction(async (transaction) => {
        const pedido = await Pedido.findByPk(pedidoId, {
            include: [{model: ItemPedido, as: 'itens'}],
            transaction,
            lock: transaction.LOCK.UPDATE
        })

        if(!pedido){
            throw new CheckoutError('Pedido nao encontrado.', 404)
        }

        if(pedido.status === 'CONFIRMADO'){
            throw new CheckoutError('Este pedido ja foi confirmado e o estoque ja foi descontado.', 409)
        }

        if(pedido.status !== 'PENDENTE'){
            throw new CheckoutError(`Um pedido ${pedido.status} nao pode ser confirmado.`, 409)
        }

        if(!pedido.itens || pedido.itens.length === 0){
            throw new CheckoutError('O pedido nao possui itens.', 409)
        }

        if(pedido.cupom_id){
            const cupom = await Cupom.findByPk(pedido.cupom_id, {
                transaction,
                lock: transaction.LOCK.UPDATE
            })
            validarCupom(cupom, Number(pedido.subtotal))
            cupom.usos_realizados += 1
            await cupom.save({transaction})
        }

        const itensOrdenados = [...pedido.itens].sort((itemA, itemB) => itemA.produto_id - itemB.produto_id)

        for(const item of itensOrdenados){
            const estoque = await Estoque.findOne({
                where: {produto_id: item.produto_id},
                transaction,
                lock: transaction.LOCK.UPDATE
            })

            if(!estoque){
                throw new CheckoutError(`Nao existe estoque cadastrado para o produto ${item.produto_id}.`, 409)
            }

            if(estoque.quantidade < item.quantidade){
                throw new CheckoutError(
                    `Estoque insuficiente para o produto ${item.produto_id}. Disponivel: ${estoque.quantidade}.`,
                    409
                )
            }

            estoque.quantidade -= item.quantidade
            estoque.ultima_movimentacao = new Date()
            await estoque.save({transaction})
        }

        pedido.status = 'CONFIRMADO'
        await pedido.save({transaction})

        return pedido
    })
}

const concluirPedido = async (pedidoId) => {
    return db.transaction(async (transaction) => {
        const pedido = await Pedido.findByPk(pedidoId, {
            transaction,
            lock: transaction.LOCK.UPDATE
        })

        if(!pedido){
            throw new CheckoutError('Pedido nao encontrado.', 404)
        }

        if(pedido.status !== 'CONFIRMADO'){
            throw new CheckoutError('Somente pedidos confirmados podem ser concluidos.', 409)
        }

        const entrega = await Entrega.findOne({
            where: {pedido_id: pedido.id},
            transaction,
            lock: transaction.LOCK.UPDATE
        })
        if(!entrega || entrega.status !== 'ENTREGUE'){
            throw new CheckoutError('O pedido so pode ser concluido apos a entrega.', 409)
        }

        pedido.status = 'CONCLUIDO'
        await pedido.save({transaction})

        return pedido
    })
}

const cancelarPedido = async (pedidoId, usuarioId, administrador) => {
    return db.transaction(async (transaction) => {
        const pedido = await Pedido.findByPk(pedidoId, {
            include: [{model: ItemPedido, as: 'itens'}],
            transaction,
            lock: transaction.LOCK.UPDATE
        })
        if(!pedido) throw new CheckoutError('Pedido nao encontrado.', 404)
        if(!administrador && pedido.usuario_id !== usuarioId){
            throw new CheckoutError('Voce nao pode cancelar este pedido.', 403)
        }
        if(!['PENDENTE', 'CONFIRMADO'].includes(pedido.status)){
            throw new CheckoutError('Este pedido nao pode ser cancelado.', 409)
        }

        const entrega = await Entrega.findOne({
            where: {pedido_id: pedido.id},
            transaction,
            lock: transaction.LOCK.UPDATE
        })
        if(entrega && entrega.status !== 'PREPARANDO'){
            throw new CheckoutError('Pedidos enviados nao podem ser cancelados.', 409)
        }

        if(pedido.status === 'CONFIRMADO'){
            if(pedido.cupom_id){
                const cupom = await Cupom.findByPk(pedido.cupom_id, {
                    transaction,
                    lock: transaction.LOCK.UPDATE
                })
                if(!cupom || cupom.usos_realizados < 1){
                    throw new CheckoutError('Nao foi possivel liberar o uso do cupom.', 409)
                }
                cupom.usos_realizados -= 1
                await cupom.save({transaction})
            }
            const itensOrdenados = [...pedido.itens].sort((a, b) => a.produto_id - b.produto_id)
            for(const item of itensOrdenados){
                const estoque = await Estoque.findOne({
                    where: {produto_id: item.produto_id},
                    transaction,
                    lock: transaction.LOCK.UPDATE
                })
                if(!estoque) throw new CheckoutError(`Estoque do produto ${item.produto_id} nao encontrado.`, 409)
                estoque.quantidade += item.quantidade
                estoque.ultima_movimentacao = new Date()
                await estoque.save({transaction})
            }
        }

        if(entrega){
            entrega.status = 'CANCELADO'
            await entrega.save({transaction})
        }
        pedido.status = 'CANCELADO'
        await pedido.save({transaction})
        return pedido
    })
}

module.exports = { validarCupom, CheckoutError, criarCheckout, confirmarPedido, concluirPedido, cancelarPedido }
