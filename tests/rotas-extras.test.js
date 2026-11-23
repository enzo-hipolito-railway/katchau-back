const test = require('node:test')
const assert = require('node:assert/strict')
const db = require('../config/db')
const { Cupom, Produto, ProdutoImagem, Categoria, Usuario } = require('../models')
const cupons = require('../controller/cupons.controller')
const produtos = require('../controller/produtos.controller')
const categorias = require('../controller/categorias.controller')
const auth = require('../controller/auth.controller')

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

test('validar cupom devolve o desconto calculado', async (t) => {
    substituir(t, Cupom, 'findOne', async () => ({codigo: 'KATCHAU10', percentual: '10.00', ativo: true, expira_em: null, limite_usos: null, usos_realizados: 0}))
    const res = resposta()
    await cupons.validar({body: {codigo: 'katchau10', subtotal: 199.9}}, res)
    assert.equal(res.codigo, 200)
    assert.equal(res.dados.desconto, 19.99)
    assert.deepEqual(res.dados.cupom, {codigo: 'KATCHAU10', percentual: 10})
})

test('validar cupom recusa cupom esgotado e inexistente', async (t) => {
    substituir(t, Cupom, 'findOne', async () => ({codigo: 'X', percentual: '5', ativo: true, expira_em: null, limite_usos: 1, usos_realizados: 1}))
    const res = resposta()
    await cupons.validar({body: {codigo: 'X', subtotal: 10}}, res)
    assert.equal(res.codigo, 409)

    substituir(t, Cupom, 'findOne', async () => null)
    const res2 = resposta()
    await cupons.validar({body: {codigo: 'NADA', subtotal: 10}}, res2)
    assert.equal(res2.codigo, 404)
})

test('cadastrar produto devolve o id criado', async (t) => {
    substituir(t, Categoria, 'findByPk', async () => ({id: 1, ativo: true}))
    substituir(t, db, 'transaction', async (fn) => fn({}))
    substituir(t, Produto, 'create', async (dados) => ({id: 42, ...dados}))
    substituir(t, ProdutoImagem, 'bulkCreate', async () => [])
    const res = resposta()
    await produtos.cadastrar({body: {codigo: 'C1', nome: 'N', descricao: 'D', preco: 10, categoria_id: 1, imagens: ['https://a.com/x.png']}}, res)
    assert.equal(res.codigo, 201)
    assert.equal(res.dados.produto.id, 42)
})

test('listagens de admin nao filtram por ativo', async (t) => {
    let filtroProd, filtroCat
    substituir(t, Produto, 'findAll', async (o) => { filtroProd = o; return [] })
    substituir(t, Categoria, 'findAll', async (o) => { filtroCat = o; return [] })
    await produtos.listarAdmin({}, resposta())
    await categorias.listarAdmin({}, resposta())
    assert.equal(filtroProd.where, undefined)
    assert.equal(filtroProd.include.find(i => i.as === 'categoria').where, undefined)
    assert.equal(filtroCat.where, undefined)
})

test('auth/me nao expoe senha_hash', async (t) => {
    let opcoes
    substituir(t, Usuario, 'findByPk', async (id, o) => { opcoes = o; return {id, nome: 'A'} })
    const res = resposta()
    await auth.me({user: {id: 5}}, res)
    assert.equal(res.codigo, 200)
    assert.ok(!opcoes.attributes.includes('senha_hash'))
})
