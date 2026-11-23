const onlyAdmin = (req, res, next) => {
    if(!req.user){
        return res.status(401).json({message: 'Usuario nao autenticado!'})
    }
    if(req.user.perfil !== 'ADMIN'){
        return res.status(403).json({message: 'Voce nao tem permissao para fazer essa acao!'})
    }
    next()
}

module.exports = { onlyAdmin }
