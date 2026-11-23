const express = require('express')
const router = express.Router()
const produtosController = require('../controller/produtos.controller')
const authMiddleware = require('../middleware/auth.middleware')
const adminMiddleware = require('../middleware/admin.middleware')

router.post('/cadastrar', authMiddleware, adminMiddleware.onlyAdmin, produtosController.cadastrar)
router.get('/listar', produtosController.listar)
router.get('/admin/listar', authMiddleware, adminMiddleware.onlyAdmin, produtosController.listarAdmin)
router.get('/consultar/:id', produtosController.consultar)
router.delete('/apagar/:id', authMiddleware, adminMiddleware.onlyAdmin, produtosController.apagar)
router.put('/atualizar/:id', authMiddleware, adminMiddleware.onlyAdmin, produtosController.atualizar)
router.patch('/atualizar-parcial/:id', authMiddleware, adminMiddleware.onlyAdmin, produtosController.atualizarParcial)

module.exports = router
