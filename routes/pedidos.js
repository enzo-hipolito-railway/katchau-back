const express = require('express')
const router = express.Router()
const pedidosController = require('../controller/pedidos.controller')
const authMiddleware = require('../middleware/auth.middleware')
const adminMiddleware = require('../middleware/admin.middleware')

router.post('/checkout', authMiddleware, pedidosController.cadastrar)
router.patch('/confirmar/:id', authMiddleware, adminMiddleware.onlyAdmin, pedidosController.confirmar)
router.patch('/concluir/:id', authMiddleware, adminMiddleware.onlyAdmin, pedidosController.concluir)
router.patch('/cancelar/:id', authMiddleware, pedidosController.cancelar)
router.get('/listar', authMiddleware, adminMiddleware.onlyAdmin, pedidosController.listar)
router.get('/meus', authMiddleware, pedidosController.meusPedidos)
router.get('/consultar/:id', authMiddleware, pedidosController.consultar)

module.exports = router
