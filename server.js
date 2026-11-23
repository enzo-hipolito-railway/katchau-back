require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const db = require('./config/db')
require('./models')
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

const authRouter = require('./routes/auth')
const produtoRouter = require('./routes/produtos')
const categoriaRouter = require('./routes/categorias')
const estoqueRouter = require('./routes/estoques')
const pedidoRouter = require('./routes/pedidos')
const itemPedidoRouter = require('./routes/itensPedido')
const entregaRouter = require('./routes/entregas')
const enderecoRouter = require('./routes/enderecos')
const cupomRouter = require('./routes/cupons')
const avaliacaoRouter = require('./routes/avaliacoes')

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors())

// ============ Rotas ============
app.get('/', (req, res) => {
    res.json({message: 'Rota raiz funcionando!'})
})

app.use('/auth', authRouter)
app.use('/produto', produtoRouter)
app.use('/categoria', categoriaRouter)
app.use('/estoque', estoqueRouter)
app.use('/pedido', pedidoRouter)
app.use('/item-pedido', itemPedidoRouter)
app.use('/entrega', entregaRouter)
app.use('/endereco', enderecoRouter)
app.use('/cupom', cupomRouter)
app.use('/avaliacao', avaliacaoRouter)

// ============ Inicialização ============
db.sync()
.then(() => {
    app.listen(PORT, () => {
        console.log('Servidor inicializado!')
    })
})
.catch((err) => {
    console.error('Erro ao inicializar servidor', err)
})
