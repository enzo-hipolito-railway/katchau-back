const jwtService = require('../services/jwt.service')
const Usuario = require('../models/Usuario')

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization

    if(!token){
        return res.status(401).json({message: 'Acesso negado. Voce precisa estar logado para realizar esta acao!'})
    }

    let decoded
    try {
        decoded = jwtService.verifyToken(token)
    }catch(err){
        return res.status(401).json({message: 'Token invalido ou expirado!'})
    }

    try {
        const usuario = await Usuario.findByPk(decoded.id || decoded.sub)
        if(!usuario){
            return res.status(401).json({message: 'Usuario nao encontrado.'})
        }
        req.user = {id: usuario.id, perfil: usuario.perfil}

        next()
    } catch (err) {
        console.error('Erro ao autenticar usuario', err)
        return res.status(500).json({message: 'Falha ao autenticar usuario.'})
    }
}

module.exports = authMiddleware
