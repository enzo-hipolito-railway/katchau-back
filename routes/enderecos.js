const express = require('express')
const router = express.Router()
const enderecosController = require('../controller/enderecos.controller')
const authMiddleware = require('../middleware/auth.middleware')

router.post('/cadastrar', authMiddleware, enderecosController.cadastrar)
router.get('/listar', authMiddleware, enderecosController.listar)
router.get('/consultar/:id', authMiddleware, enderecosController.consultar)
router.delete('/apagar/:id', authMiddleware, enderecosController.apagar)
router.put('/atualizar/:id', authMiddleware, enderecosController.atualizar)
router.patch('/atualizar-parcial/:id', authMiddleware, enderecosController.atualizarParcial)

module.exports = router
