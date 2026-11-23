const express = require('express')
const router = express.Router()
const itensPedidoController = require('../controller/itensPedido.controller')
const authMiddleware = require('../middleware/auth.middleware')
const adminMiddleware = require('../middleware/admin.middleware')

router.get('/listar', authMiddleware, adminMiddleware.onlyAdmin, itensPedidoController.listar)
router.get('/consultar/:id', authMiddleware, adminMiddleware.onlyAdmin, itensPedidoController.consultar)

module.exports = router
