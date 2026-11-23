const { Cupom } = require('../models')
const { validarCupom, CheckoutError } = require('../services/checkout.service')

class DadosCupomInvalidos extends Error {}

const normalizarDados = (dados, cupom) => {
    const valores = {}
    for(const campo of ['codigo', 'percentual', 'limite_usos', 'expira_em', 'ativo']){
        if(dados[campo] !== undefined) valores[campo] = dados[campo]
    }
    if(Object.keys(valores).length === 0) throw new DadosCupomInvalidos('Informe os dados do cupom.')

    if(valores.codigo !== undefined){
        if(typeof valores.codigo !== 'string') throw new DadosCupomInvalidos('Codigo de cupom invalido.')
        valores.codigo = valores.codigo.trim().toUpperCase()
        if(!/^[A-Z0-9_-]{3,40}$/.test(valores.codigo)){
            throw new DadosCupomInvalidos('O codigo deve ter de 3 a 40 letras, numeros, _ ou -.')
        }
    }

    if(valores.percentual !== undefined){
        const percentual = Number(valores.percentual)
        if(!Number.isFinite(percentual) || percentual <= 0 || percentual > 100 ||
            Math.abs(percentual * 100 - Math.round(percentual * 100)) >= 1e-8){
            throw new DadosCupomInvalidos('O percentual deve ser maior que zero e no maximo 100, com ate duas casas decimais.')
        }
        valores.percentual = percentual
    }

    if(valores.limite_usos !== undefined && valores.limite_usos !== null){
        const limite = Number(valores.limite_usos)
        if(!Number.isSafeInteger(limite) || limite < 1 || limite < Number(cupom?.usos_realizados || 0)){
            throw new DadosCupomInvalidos('Limite de usos invalido ou inferior aos usos realizados.')
        }
        valores.limite_usos = limite
    }

    if(valores.expira_em !== undefined && valores.expira_em !== null){
        if(typeof valores.expira_em !== 'string' ||
            !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(valores.expira_em)){
            throw new DadosCupomInvalidos('Data de expiracao invalida. Use ISO 8601 com fuso horario.')
        }
        const data = new Date(valores.expira_em)
        if(Number.isNaN(data.getTime())) throw new DadosCupomInvalidos('Data de expiracao invalida.')
        valores.expira_em = data
    }
    if(valores.ativo !== undefined && typeof valores.ativo !== 'boolean'){
        throw new DadosCupomInvalidos('Ativo deve ser booleano.')
    }
    return valores
}

const responderErro = (res, err, acao) => {
    if(err.name === 'SequelizeUniqueConstraintError') return res.status(409).json({message: 'Codigo de cupom ja cadastrado.'})
    if(err instanceof DadosCupomInvalidos || err.name === 'SequelizeValidationError'){
        return res.status(400).json({message: err.message})
    }
    console.error(`Erro ao ${acao} cupom`, err)
    return res.status(500).json({message: `Falha ao ${acao} cupom.`})
}

const cadastrar = async (req, res) => {
    try{
        const valores = normalizarDados(req.body)
        if(!valores.codigo || valores.percentual === undefined){
            return res.status(400).json({message: 'Informe codigo e percentual.'})
        }
        const cupom = await Cupom.create(valores)
        return res.status(201).json({message: 'Cupom cadastrado com sucesso!', cupom})
    }catch(err){
        return responderErro(res, err, 'cadastrar')
    }
}

const listar = async (req, res) => {
    try{
        const cupons = await Cupom.findAll({order: [['id', 'DESC']]})
        return res.status(200).json({cupons})
    }catch(err){
        return responderErro(res, err, 'listar')
    }
}

const consultar = async (req, res) => {
    try{
        const cupom = await Cupom.findByPk(req.params.id)
        if(!cupom) return res.status(404).json({message: 'Cupom nao encontrado.'})
        return res.status(200).json({cupom})
    }catch(err){
        return responderErro(res, err, 'consultar')
    }
}

const atualizar = async (req, res) => {
    try{
        const cupom = await Cupom.findByPk(req.params.id)
        if(!cupom) return res.status(404).json({message: 'Cupom nao encontrado.'})
        const valores = normalizarDados(req.body, cupom)
        await cupom.update(valores)
        return res.status(200).json({message: 'Cupom atualizado com sucesso!', cupom})
    }catch(err){
        return responderErro(res, err, 'atualizar')
    }
}

// Previa do desconto para o carrinho. O checkout recalcula tudo no servidor.
const validar = async (req, res) => {
    const { codigo, subtotal } = req.body || {}
    if(typeof codigo !== 'string' || !codigo.trim()){
        return res.status(400).json({message: 'Informe o codigo do cupom.'})
    }
    const valorSubtotal = Number(subtotal)
    if(!Number.isFinite(valorSubtotal) || valorSubtotal < 0){
        return res.status(400).json({message: 'Subtotal invalido.'})
    }
    try{
        const cupom = await Cupom.findOne({where: {codigo: codigo.trim().toUpperCase()}})
        const desconto = validarCupom(cupom, valorSubtotal)
        return res.status(200).json({cupom: {codigo: cupom.codigo, percentual: Number(cupom.percentual)}, desconto})
    }catch(err){
        if(err instanceof CheckoutError) return res.status(err.status).json({message: err.message})
        return responderErro(res, err, 'validar')
    }
}

module.exports = { cadastrar, listar, consultar, atualizar, validar }
