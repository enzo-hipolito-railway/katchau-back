const test = require('node:test')
const assert = require('node:assert/strict')
const { Cupom } = require('../models')
const controller = require('../controller/cupons.controller')

const resposta = () => ({
    codigo: 200,
    status(codigo){ this.codigo = codigo; return this },
    json(dados){ this.dados = dados; return this }
})

test('cadastro normaliza codigo e aceita validade e limite opcionais', async (t) => {
    const original = Cupom.create
    let valoresCriados
    Cupom.create = async (valores) => { valoresCriados = valores; return valores }
    t.after(() => { Cupom.create = original })

    const res = resposta()
    await controller.cadastrar({body: {codigo: ' promo_10 ', percentual: 10}}, res)
    assert.equal(res.codigo, 201)
    assert.equal(valoresCriados.codigo, 'PROMO_10')
    assert.equal(valoresCriados.percentual, 10)
    assert.equal(valoresCriados.limite_usos, undefined)
    assert.equal(valoresCriados.expira_em, undefined)
})

test('cadastro rejeita percentual e expiracao invalidos', async () => {
    const percentualInvalido = resposta()
    await controller.cadastrar({body: {codigo: 'PROMO10', percentual: 101}}, percentualInvalido)
    assert.equal(percentualInvalido.codigo, 400)

    const dataInvalida = resposta()
    await controller.cadastrar({body: {codigo: 'PROMO10', percentual: 10, expira_em: 'amanha'}}, dataInvalida)
    assert.equal(dataInvalida.codigo, 400)
})
