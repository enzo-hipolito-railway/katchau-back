const express = require('express')
const router = express.Router()
const controller = require('../controller/cupons.controller')
const authMiddleware = require('../middleware/auth.middleware')
const { onlyAdmin } = require('../middleware/admin.middleware')

router.post('/cadastrar', authMiddleware, onlyAdmin, controller.cadastrar)
router.post('/validar', authMiddleware, controller.validar)
router.get('/listar', authMiddleware, onlyAdmin, controller.listar)
router.get('/consultar/:id', authMiddleware, onlyAdmin, controller.consultar)
router.patch('/atualizar-parcial/:id', authMiddleware, onlyAdmin, controller.atualizar)

module.exports = router
