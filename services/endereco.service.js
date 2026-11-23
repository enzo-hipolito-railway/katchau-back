const formatarEndereco = (endereco) => [
    `${endereco.rua}, ${endereco.numero}`,
    endereco.complemento,
    endereco.bairro,
    `${endereco.cidade}/${endereco.uf}`,
    `CEP ${endereco.cep}`
].filter(Boolean).join(' - ')

module.exports = { formatarEndereco }
