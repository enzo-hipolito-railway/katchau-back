const express = require('express')
const router = express.Router()
const estoquesController = require('../controller/estoques.controller')
const authMiddleware = require('../middleware/auth.middleware')
const adminMiddleware = require('../middleware/admin.middleware')

router.post('/cadastrar', authMiddleware, adminMiddleware.onlyAdmin, estoquesController.cadastrar)
router.get('/listar', authMiddleware, adminMiddleware.onlyAdmin, estoquesController.listar)
router.get('/consultar/:id', authMiddleware, adminMiddleware.onlyAdmin, estoquesController.consultar)
router.put('/atualizar/:id', authMiddleware, adminMiddleware.onlyAdmin, estoquesController.atualizar)
router.patch('/atualizar-parcial/:id', authMiddleware, adminMiddleware.onlyAdmin, estoquesController.atualizarParcial)

module.exports = router
