const express = require('express')
const router = express.Router()
const entregasController = require('../controller/entregas.controller')
const authMiddleware = require('../middleware/auth.middleware')
const adminMiddleware = require('../middleware/admin.middleware')

router.post('/cadastrar', authMiddleware, adminMiddleware.onlyAdmin, entregasController.cadastrar)
router.get('/listar', authMiddleware, adminMiddleware.onlyAdmin, entregasController.listar)
router.get('/consultar/:id', authMiddleware, entregasController.consultar)
router.patch('/atualizar-parcial/:id', authMiddleware, adminMiddleware.onlyAdmin, entregasController.atualizar)

module.exports = router
