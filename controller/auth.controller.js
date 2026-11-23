const Usuario = require('../models/Usuario')
const jwt = require('../services/jwt.service')
const bcrypt = require('../services/bcrypt.service')

const login = async (req, res) => {
    const {email, senha} = req.body

    if(typeof email !== 'string' || !email.trim() || typeof senha !== 'string' || !senha){
        return res.status(400).json({message: 'Informe email e senha.'})
    }

    try{
        const usuario = await Usuario.findOne({where: {email: email.trim().toLowerCase()}})

        if(!usuario){
            return res.status(404).json({message: 'Esse usuario nao existe!'})
        }

        const senhaCript = bcrypt.hashCompare(senha, usuario.senha_hash)

        if(!senhaCript){
            return res.status(401).json({message: 'Senha incorreta'})
        }

        const payload = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
        }
        const token = jwt.generateToken(payload)

        return res.status(200).json({message: 'Login realizado com sucesso!', token})
    }
    catch(err){
        res.status(500).json({message: 'Falha ao realizar o seu login!'})
        console.error(err)
    }
}

const register = async (req, res) => {
    const valores = req.body

    if(typeof valores.nome !== 'string' || !valores.nome.trim() ||
        typeof valores.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valores.email) ||
        typeof valores.senha !== 'string' || valores.senha.length < 8 ||
        typeof valores.cpf !== 'string' || !/^\d{11}$/.test(valores.cpf)){
        return res.status(400).json({message: 'Informe nome, email valido, senha com ao menos 8 caracteres e CPF com 11 digitos.'})
    }

    if(valores.cargo || valores.perfil){
        return res.status(403).json({message: 'Voce nao pode enviar um perfil na requisicao!'})
    }

    const senhaCript = bcrypt.hashGenerator(valores.senha)

    const valores2 = {
        nome: valores.nome.trim(),
        email: valores.email.trim().toLowerCase(),
        senha_hash: senhaCript,
        cpf: valores.cpf
    }

    try{
        await Usuario.create(valores2)

        res.status(201).json({message: 'Usuario registrado com sucesso!'})
    }catch(err){
        if(err.name === 'SequelizeUniqueConstraintError'){
            return res.status(409).json({message: 'Email ou CPF ja cadastrado.'})
        }
        res.status(500).json({message: 'Falha ao registrar usuario.'})
        console.error('Erro ao registrar usuario', err)
    }
}

const me = async (req, res) => {
    try{
        const usuario = await Usuario.findByPk(req.user.id, {
            attributes: ['id', 'nome', 'email', 'cpf', 'perfil', 'createdAt']
        })
        if(!usuario) return res.status(404).json({message: 'Usuario nao encontrado.'})
        return res.status(200).json({usuario})
    }catch(err){
        console.error('Erro ao consultar usuario logado', err)
        return res.status(500).json({message: 'Falha ao consultar usuario.'})
    }
}

module.exports = { login, register, me }
