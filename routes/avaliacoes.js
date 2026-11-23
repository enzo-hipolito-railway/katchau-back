const express = require('express')
const router = express.Router()
const controller = require('../controller/avaliacoes.controller')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/produto/:produtoId', controller.listarPorProduto)
router.post('/cadastrar', authMiddleware, controller.cadastrar)
router.patch('/atualizar-parcial/:id', authMiddleware, controller.atualizar)
router.delete('/apagar/:id', authMiddleware, controller.apagar)

module.exports = router
