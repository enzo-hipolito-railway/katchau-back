const test = require('node:test')
const assert = require('node:assert/strict')
const { Entrega } = require('../models')
const controller = require('../controller/entregas.controller')

const resposta = () => ({
    codigo: 200,
    status(codigo){ this.codigo = codigo; return this },
    json(dados){ this.dados = dados; return this }
})

test('consulta de entrega permite somente o dono ou ADMIN', async (t) => {
    const original = Entrega.findByPk
    Entrega.findByPk = async () => ({id: 5, pedido: {usuario_id: 2}})
    t.after(() => { Entrega.findByPk = original })

    const outroUsuario = resposta()
    await controller.consultar({params: {id: 5}, user: {id: 3, perfil: 'CLIENTE'}}, outroUsuario)
    assert.equal(outroUsuario.codigo, 403)

    const dono = resposta()
    await controller.consultar({params: {id: 5}, user: {id: 2, perfil: 'CLIENTE'}}, dono)
    assert.equal(dono.codigo, 200)

    const administrador = resposta()
    await controller.consultar({params: {id: 5}, user: {id: 3, perfil: 'ADMIN'}}, administrador)
    assert.equal(administrador.codigo, 200)
})
