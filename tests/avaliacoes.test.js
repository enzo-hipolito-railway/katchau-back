const test = require('node:test')
const assert = require('node:assert/strict')
const { Avaliacao, Produto, ItemPedido } = require('../models')
const controller = require('../controller/avaliacoes.controller')

const resposta = () => ({
    codigo: 200,
    status(codigo){ this.codigo = codigo; return this },
    json(dados){ this.dados = dados; return this }
})

const substituir = (t, alvo, metodo, fn) => {
    const original = alvo[metodo]
    alvo[metodo] = fn
    t.after(() => { alvo[metodo] = original })
}

test('cadastro rejeita nota fora de 1 a 5', async () => {
    const res = resposta()
    await controller.cadastrar({body: {produto_id: 1, nota: 6}, user: {id: 1}}, res)
    assert.equal(res.codigo, 400)
})

test('cadastro bloqueia quem nao comprou o produto', async (t) => {
    substituir(t, Produto, 'findByPk', async () => ({id: 1}))
    substituir(t, ItemPedido, 'findOne', async () => null)
    let criou = false
    substituir(t, Avaliacao, 'create', async () => { criou = true })

    const res = resposta()
    await controller.cadastrar({body: {produto_id: 1, nota: 5}, user: {id: 7}}, res)
    assert.equal(res.codigo, 403)
    assert.equal(criou, false)
})

test('cadastro aceita quem comprou, ignorando pedidos cancelados na busca', async (t) => {
    substituir(t, Produto, 'findByPk', async () => ({id: 1}))
    let filtro
    substituir(t, ItemPedido, 'findOne', async (opcoes) => { filtro = opcoes; return {id: 3} })
    let valores
    substituir(t, Avaliacao, 'create', async (v) => { valores = v; return v })

    const res = resposta()
    await controller.cadastrar({body: {produto_id: 1, nota: 4, comentario: '  bom  '}, user: {id: 7}}, res)
    assert.equal(res.codigo, 201)
    assert.deepEqual(valores, {nota: 4, comentario: 'bom', produto_id: 1, usuario_id: 7})
    assert.equal(filtro.include[0].where.usuario_id, 7)
})
