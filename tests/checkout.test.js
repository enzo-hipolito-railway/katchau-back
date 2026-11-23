const test = require('node:test')
const assert = require('node:assert/strict')
const db = require('../config/db')
const { Pedido, ItemPedido, Produto, Estoque, Cupom, Entrega, Endereco } = require('../models')
const checkout = require('../services/checkout.service')

const substituir = (t, objeto, metodo, implementacao) => {
    const original = objeto[metodo]
    objeto[metodo] = implementacao
    t.after(() => { objeto[metodo] = original })
}

const transacaoSimulada = async (callback) => callback({LOCK: {UPDATE: 'UPDATE'}})

test('checkout calcula desconto percentual em centavos e agrupa itens iguais', async (t) => {
    substituir(t, db, 'transaction', transacaoSimulada)
    substituir(t, Endereco, 'findOne', async () => ({rua: 'Rua A', numero: 1, bairro: 'Centro', cidade: 'Cidade', uf: 'SP', cep: '00000000'}))
    substituir(t, Produto, 'findAll', async () => [{id: 1, preco: '5.03'}])
    substituir(t, Estoque, 'findAll', async () => [{produto_id: 1, quantidade: 10}])
    substituir(t, Cupom, 'findOne', async () => ({id: 7, ativo: true, percentual: '10.00', limite_usos: 1, usos_realizados: 0, expira_em: null}))
    let pedidoCriado
    substituir(t, Pedido, 'create', async (valores) => {
        pedidoCriado = {...valores, id: 8}
        return pedidoCriado
    })
    let itensCriados
    substituir(t, ItemPedido, 'bulkCreate', async (itens) => { itensCriados = itens })
    substituir(t, Pedido, 'findByPk', async () => pedidoCriado)

    await checkout.criarCheckout({
        usuarioId: 2,
        enderecoId: 3,
        itens: [{produto_id: 1, quantidade: 1}, {produto_id: 1, quantidade: 1}],
        cupomCodigo: ' promo10 '
    })

    assert.equal(pedidoCriado.cupom_id, 7)
    assert.equal(pedidoCriado.endereco_entrega, 'Rua A, 1 - Centro - Cidade/SP - CEP 00000000')
    assert.equal(pedidoCriado.subtotal, 10.06)
    assert.equal(pedidoCriado.desconto, 1.01)
    assert.equal(pedidoCriado.total, 9.05)
    assert.equal(itensCriados.length, 1)
    assert.equal(itensCriados[0].quantidade, 2)
})

test('checkout rejeita cupom expirado ou esgotado', async (t) => {
    substituir(t, db, 'transaction', transacaoSimulada)
    substituir(t, Endereco, 'findOne', async () => ({rua: 'Rua A', numero: 1, bairro: 'Centro', cidade: 'Cidade', uf: 'SP', cep: '00000000'}))
    substituir(t, Produto, 'findAll', async () => [{id: 1, preco: '10.00'}])
    substituir(t, Estoque, 'findAll', async () => [{produto_id: 1, quantidade: 10}])
    let cupom = {id: 7, ativo: true, percentual: '20.00', limite_usos: 1, usos_realizados: 0, expira_em: new Date(0)}
    substituir(t, Cupom, 'findOne', async () => cupom)
    const dados = {usuarioId: 2, enderecoId: 3, itens: [{produto_id: 1, quantidade: 1}], cupomCodigo: 'PROMO'}

    await assert.rejects(checkout.criarCheckout(dados), {message: 'Cupom indisponivel ou fora da validade.'})
    cupom = {...cupom, expira_em: null, usos_realizados: 1}
    await assert.rejects(checkout.criarCheckout(dados), {message: 'Cupom esgotado.'})
})

test('checkout exige endereco pertencente ao comprador', async (t) => {
    substituir(t, db, 'transaction', transacaoSimulada)
    substituir(t, Endereco, 'findOne', async () => null)
    await assert.rejects(checkout.criarCheckout({
        usuarioId: 2,
        enderecoId: 3,
        itens: [{produto_id: 1, quantidade: 1}]
    }), {status: 404})
})

test('confirmacao desconta estoque e consome o cupom uma unica vez', async (t) => {
    substituir(t, db, 'transaction', transacaoSimulada)
    const pedido = {id: 8, status: 'PENDENTE', subtotal: '10.00', cupom_id: 7,
        itens: [{produto_id: 1, quantidade: 2}], async save(){}}
    const cupom = {ativo: true, percentual: '10.00', limite_usos: 1, usos_realizados: 0, expira_em: null, async save(){}}
    const estoque = {quantidade: 3, async save(){}}
    substituir(t, Pedido, 'findByPk', async () => pedido)
    substituir(t, Cupom, 'findByPk', async () => cupom)
    substituir(t, Estoque, 'findOne', async () => estoque)

    await checkout.confirmarPedido(8)
    assert.equal(pedido.status, 'CONFIRMADO')
    assert.equal(estoque.quantidade, 1)
    assert.equal(cupom.usos_realizados, 1)
    await assert.rejects(checkout.confirmarPedido(8), {status: 409})
    assert.equal(estoque.quantidade, 1)
    assert.equal(cupom.usos_realizados, 1)
})

test('cancelamento devolve estoque e libera uso do cupom', async (t) => {
    substituir(t, db, 'transaction', transacaoSimulada)
    const pedido = {id: 8, usuario_id: 2, status: 'CONFIRMADO', cupom_id: 7,
        itens: [{produto_id: 1, quantidade: 2}], async save(){}}
    const cupom = {usos_realizados: 1, async save(){}}
    const estoque = {quantidade: 1, async save(){}}
    const entrega = {status: 'PREPARANDO', async save(){}}
    substituir(t, Pedido, 'findByPk', async () => pedido)
    substituir(t, Cupom, 'findByPk', async () => cupom)
    substituir(t, Estoque, 'findOne', async () => estoque)
    substituir(t, Entrega, 'findOne', async () => entrega)

    await assert.rejects(checkout.cancelarPedido(8, 3, false), {status: 403})
    await checkout.cancelarPedido(8, 2, false)
    assert.equal(pedido.status, 'CANCELADO')
    assert.equal(entrega.status, 'CANCELADO')
    assert.equal(estoque.quantidade, 3)
    assert.equal(cupom.usos_realizados, 0)
    await assert.rejects(checkout.cancelarPedido(8, 2, false), {status: 409})
})

test('pedido so e concluido quando a entrega estiver ENTREGUE', async (t) => {
    substituir(t, db, 'transaction', transacaoSimulada)
    const pedido = {status: 'CONFIRMADO', async save(){}}
    const entrega = {status: 'EM_TRANSITO'}
    substituir(t, Pedido, 'findByPk', async () => pedido)
    substituir(t, Entrega, 'findOne', async () => entrega)

    await assert.rejects(checkout.concluirPedido(8), {status: 409})
    entrega.status = 'ENTREGUE'
    await checkout.concluirPedido(8)
    assert.equal(pedido.status, 'CONCLUIDO')
})
