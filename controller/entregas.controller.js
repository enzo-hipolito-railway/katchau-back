const { Entrega, Pedido, Endereco } = require('../models')
const db = require('../config/db')
const { formatarEndereco } = require('../services/endereco.service')

const transicoes = {
    PREPARANDO: ['ENVIADO'],
    ENVIADO: ['EM_TRANSITO', 'ENTREGUE'],
    EM_TRANSITO: ['ENTREGUE'],
    ENTREGUE: [],
    CANCELADO: []
}

const cadastrar = async (req, res) => {
    if(!req.body.pedido_id){
        return res.status(400).json({message: 'Informe pedido_id.'})
    }

    try{
        const entrega = await db.transaction(async (transaction) => {
            const pedido = await Pedido.findByPk(req.body.pedido_id, {
                transaction,
                lock: transaction.LOCK.UPDATE
            })
            if(!pedido) throw Object.assign(new Error('Pedido nao encontrado.'), {status: 404})
            if(pedido.status !== 'CONFIRMADO'){
                throw Object.assign(new Error('Somente pedidos confirmados podem receber entrega.'), {status: 409})
            }
            let enderecoCompleto = pedido.endereco_entrega
            if(!enderecoCompleto){
                if(!req.body.endereco_id){
                    throw Object.assign(new Error('Pedido antigo sem endereco: informe endereco_id do comprador.'), {status: 400})
                }
                const endereco = await Endereco.findOne({
                    where: {id: req.body.endereco_id, idUsuario: pedido.usuario_id},
                    transaction
                })
                if(!endereco){
                    throw Object.assign(new Error('Endereco nao encontrado para o usuario do pedido.'), {status: 404})
                }
                enderecoCompleto = formatarEndereco(endereco)
            }

            return Entrega.create({
                pedido_id: pedido.id,
                endereco_completo: enderecoCompleto
            }, {transaction})
        })

        res.status(201).json({message: 'Entrega cadastrada com sucesso!', entrega})
    }
    catch(err){
        if(err.status) return res.status(err.status).json({message: err.message})
        if(err.name === 'SequelizeUniqueConstraintError') return res.status(409).json({message: 'Este pedido ja possui entrega.'})
        console.error('Erro ao cadastrar entrega', err)
        res.status(500).json({message: 'Falha ao cadastrar entrega.'})
    }
}

const listar = async (req, res) => {
    try{
        const entregas = await Entrega.findAll()

        res.status(200).json({entregas})
    }
    catch(err){
        console.error('Erro ao listar entregas', err)
        res.status(500).json({message: 'Falha ao listar entregas.'})
    }
}

const consultar = async (req, res) => {
    const id = req.params.id

    try{
        const entrega = await Entrega.findByPk(id, {include: [{model: Pedido, as: 'pedido'}]})

        if(!entrega){
            return res.status(404).json({message: `A Entrega com id ${id} nao existe!`})
        }

        if(entrega.pedido.usuario_id !== (req.user.id || req.user.sub) && req.user.perfil !== 'ADMIN'){
            return res.status(403).json({message: 'Voce nao pode consultar esta entrega.'})
        }

        res.status(200).json({entrega})
    }
    catch(err){
        console.error('Erro ao consultar entrega', err)
        res.status(500).json({message: 'Falha ao consultar entrega.'})
    }
}

const atualizar = async (req, res) => {
    const id = req.params.id

    try{
        const entrega = await Entrega.findByPk(id)

        if(!entrega){
            return res.status(404).json({message: `A Entrega com id ${id} nao existe!`})
        }

        const campos = ['codigo_rastreio', 'previsao_entrega']
        const valores = {}
        for(const campo of campos){
            if(req.body[campo] !== undefined) valores[campo] = req.body[campo]
        }
        if(req.body.status !== undefined) valores.status = req.body.status
        if(Object.keys(valores).length === 0){
            return res.status(400).json({message: 'Informe status, codigo_rastreio ou previsao_entrega.'})
        }
        if(valores.codigo_rastreio !== undefined && valores.codigo_rastreio !== null &&
            (typeof valores.codigo_rastreio !== 'string' || valores.codigo_rastreio.length > 80)){
            return res.status(400).json({message: 'Codigo de rastreio invalido.'})
        }
        if(valores.previsao_entrega !== undefined && valores.previsao_entrega !== null &&
            (typeof valores.previsao_entrega !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valores.previsao_entrega) ||
                Number.isNaN(new Date(valores.previsao_entrega).getTime()) ||
                new Date(valores.previsao_entrega).toISOString().slice(0, 10) !== valores.previsao_entrega)){
            return res.status(400).json({message: 'Previsao de entrega invalida. Use AAAA-MM-DD.'})
        }

        await db.transaction(async (transaction) => {
            const pedido = await Pedido.findByPk(entrega.pedido_id, {
                transaction,
                lock: transaction.LOCK.UPDATE
            })
            if(!pedido || pedido.status !== 'CONFIRMADO'){
                throw Object.assign(new Error('Somente entregas de pedidos confirmados podem ser alteradas.'), {status: 409})
            }
            const entregaAtual = await Entrega.findByPk(id, {
                transaction,
                lock: transaction.LOCK.UPDATE
            })
            if(valores.status !== undefined){
                if(!transicoes[entregaAtual.status]?.includes(valores.status)){
                    throw Object.assign(new Error('Transicao de status da entrega invalida.'), {status: 409})
                }
                if(valores.status === 'ENTREGUE') valores.data_entrega = new Date()
            }
            await entregaAtual.update(valores, {transaction})
        })

        res.status(200).json({message: `Entrega com id ${id} foi atualizada com sucesso!`})
    }
    catch(err){
        if(err.status) return res.status(err.status).json({message: err.message})
        console.error('Erro ao atualizar entrega', err)
        res.status(500).json({message: 'Falha ao atualizar entrega.'})
    }
}

module.exports = { cadastrar, listar, consultar, atualizar }
