const express = require('express')
const router = express.Router()
const categoriasController = require('../controller/categorias.controller')
const authMiddleware = require('../middleware/auth.middleware')
const adminMiddleware = require('../middleware/admin.middleware')

router.post('/cadastrar', authMiddleware, adminMiddleware.onlyAdmin, categoriasController.cadastrar)
router.get('/listar', categoriasController.listar)
router.get('/admin/listar', authMiddleware, adminMiddleware.onlyAdmin, categoriasController.listarAdmin)
router.get('/consultar/:id', categoriasController.consultar)
router.delete('/apagar/:id', authMiddleware, adminMiddleware.onlyAdmin, categoriasController.apagar)
router.put('/atualizar/:id', authMiddleware, adminMiddleware.onlyAdmin, categoriasController.atualizar)
router.patch('/atualizar-parcial/:id', authMiddleware, adminMiddleware.onlyAdmin, categoriasController.atualizarParcial)

module.exports = router
