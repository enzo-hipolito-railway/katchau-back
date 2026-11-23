const { Categoria } = require('../models')

const cadastrar = async (req, res) => {
    if(!req.body.nome){
        return res.status(400).json({message: 'Preencha o campo obrigatorio: nome.'})
    }

    try{
        const {nome, descricao, ativo} = req.body
        const categoria = await Categoria.create({nome, descricao, ativo})

        res.status(201).json({message: 'Categoria cadastrada com sucesso!', categoria})
    }
    catch(err){
        console.error('Erro ao cadastrar categoria', err)
        res.status(500).json({message: 'Falha ao cadastrar categoria.'})
    }
}

const listar = async (req, res) => {
    try{
        const categorias = await Categoria.findAll({where: {ativo: true}})

        res.status(200).json({categorias})
    }
    catch(err){
        console.error('Erro ao listar categorias', err)
        res.status(500).json({message: 'Falha ao listar categorias.'})
    }
}

const listarAdmin = async (req, res) => {
    try{
        const categorias = await Categoria.findAll({order: [['id', 'ASC']]})

        res.status(200).json({categorias})
    }
    catch(err){
        console.error('Erro ao listar categorias (admin)', err)
        res.status(500).json({message: 'Falha ao listar categorias.'})
    }
}

const consultar = async (req, res) => {
    const id = req.params.id

    try{
        const categoria = await Categoria.findByPk(id)

        if(!categoria || !categoria.ativo){
            return res.status(404).json({message: `A Categoria com id ${id} nao existe!`})
        }

        res.status(200).json({categoria})
    }
    catch(err){
        console.error('Erro ao consultar categoria', err)
        res.status(500).json({message: 'Falha ao consultar categoria.'})
    }
}

const apagar = async (req, res) => {
    const id = req.params.id

    try{
        const categoria = await Categoria.findByPk(id)

        if(!categoria){
            return res.status(404).json({message: `A Categoria com id ${id} nao existe!`})
        }

        await Categoria.update({ativo: false}, {where: {id}})

        res.status(200).json({message: `Categoria com id ${id} foi desativada com sucesso!`})
    }
    catch(err){
        console.error('Erro ao apagar categoria', err)
        res.status(500).json({message: 'Falha ao apagar categoria.'})
    }
}

const atualizar = async (req, res) => {
    const id = req.params.id

    try{
        const categoria = await Categoria.findByPk(id)

        if(!categoria){
            return res.status(404).json({message: `A Categoria com id ${id} nao existe!`})
        }

        const valores = {}
        for(const campo of ['nome', 'descricao', 'ativo']){
            if(req.body[campo] !== undefined) valores[campo] = req.body[campo]
        }
        if(Object.keys(valores).length === 0){
            return res.status(400).json({message: 'Informe nome, descricao ou ativo.'})
        }
        await Categoria.update(valores, {where: {id}})

        res.status(200).json({message: `Categoria com id ${id} foi atualizada com sucesso!`})
    }
    catch(err){
        console.error('Erro ao atualizar categoria', err)
        res.status(500).json({message: 'Falha ao atualizar categoria.'})
    }
}

const atualizarParcial = async (req, res) => {
    await atualizar(req, res)
}

module.exports = { cadastrar, listar, listarAdmin, consultar, apagar, atualizar, atualizarParcial }
