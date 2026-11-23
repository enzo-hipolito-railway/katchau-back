const { Op } = require('sequelize')
const { Avaliacao, Usuario, Produto, Pedido, ItemPedido } = require('../models')

const usuarioComprouProduto = async (usuarioId, produtoId) => {
    const item = await ItemPedido.findOne({
        where: {produto_id: produtoId},
        include: [{
            model: Pedido,
            as: 'pedido',
            required: true,
            where: {
                usuario_id: usuarioId,
                status: {[Op.ne]: 'CANCELADO'}
            }
        }]
    })
    return Boolean(item)
}

const validarDados = (dados) => {
    const valores = {}
    if(dados.nota !== undefined){
        const nota = Number(dados.nota)
        if(!Number.isInteger(nota) || nota < 1 || nota > 5){
            throw Object.assign(new Error('A nota deve ser um inteiro de 1 a 5.'), {status: 400})
        }
        valores.nota = nota
    }
    if(dados.comentario !== undefined){
        if(dados.comentario !== null && typeof dados.comentario !== 'string'){
            throw Object.assign(new Error('Comentario invalido.'), {status: 400})
        }
        const comentario = dados.comentario?.trim() || null
        if(comentario && comentario.length > 2000){
            throw Object.assign(new Error('O comentario deve ter no maximo 2000 caracteres.'), {status: 400})
        }
        valores.comentario = comentario
    }
    return valores
}

const responderErro = (res, err, acao) => {
    if(err.status) return res.status(err.status).json({message: err.message})
    if(err.name === 'SequelizeUniqueConstraintError'){
        return res.status(409).json({message: 'Voce ja avaliou este produto.'})
    }
    if(err.name === 'SequelizeValidationError') return res.status(400).json({message: err.message})
    console.error(`Erro ao ${acao} avaliacao`, err)
    return res.status(500).json({message: `Falha ao ${acao} avaliacao.`})
}

const listarPorProduto = async (req, res) => {
    try{
        const avaliacoes = await Avaliacao.findAll({
            where: {produto_id: req.params.produtoId},
            include: [{model: Usuario, as: 'usuario', attributes: ['id', 'nome']}],
            order: [['createdAt', 'DESC']]
        })
        const total = avaliacoes.length
        const media = total ? avaliacoes.reduce((soma, a) => soma + a.nota, 0) / total : 0

        return res.status(200).json({media: Math.round(media * 10) / 10, total, avaliacoes})
    }catch(err){
        return responderErro(res, err, 'listar')
    }
}

const cadastrar = async (req, res) => {
    try{
        const produtoId = Number(req.body.produto_id)
        if(!Number.isSafeInteger(produtoId) || produtoId <= 0){
            return res.status(400).json({message: 'Informe um produto_id valido.'})
        }
        const valores = validarDados(req.body)
        if(valores.nota === undefined){
            return res.status(400).json({message: 'Informe a nota.'})
        }

        const produto = await Produto.findByPk(produtoId)
        if(!produto) return res.status(404).json({message: 'Produto nao encontrado.'})

        if(!await usuarioComprouProduto(req.user.id, produtoId)){
            return res.status(403).json({message: 'Somente quem comprou este produto pode avalia-lo.'})
        }

        const avaliacao = await Avaliacao.create({
            ...valores,
            produto_id: produtoId,
            usuario_id: req.user.id
        })
        return res.status(201).json({message: 'Avaliacao cadastrada com sucesso!', avaliacao})
    }catch(err){
        return responderErro(res, err, 'cadastrar')
    }
}

const atualizar = async (req, res) => {
    try{
        const avaliacao = await Avaliacao.findOne({where: {id: req.params.id, usuario_id: req.user.id}})
        if(!avaliacao) return res.status(404).json({message: 'Avaliacao nao encontrada.'})

        const valores = validarDados(req.body)
        if(Object.keys(valores).length === 0){
            return res.status(400).json({message: 'Informe nota ou comentario.'})
        }
        await avaliacao.update(valores)
        return res.status(200).json({message: 'Avaliacao atualizada com sucesso!', avaliacao})
    }catch(err){
        return responderErro(res, err, 'atualizar')
    }
}

const apagar = async (req, res) => {
    try{
        const where = {id: req.params.id}
        if(req.user.perfil !== 'ADMIN') where.usuario_id = req.user.id

        const avaliacao = await Avaliacao.findOne({where})
        if(!avaliacao) return res.status(404).json({message: 'Avaliacao nao encontrada.'})

        await avaliacao.destroy()
        return res.status(200).json({message: 'Avaliacao apagada com sucesso!'})
    }catch(err){
        return responderErro(res, err, 'apagar')
    }
}

module.exports = { listarPorProduto, cadastrar, atualizar, apagar, usuarioComprouProduto }
