require('dotenv').config()
const bcrypt = require('bcrypt')

const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || process.env.SALT_ROUNDS || 12)

function hashGenerator(pass){
    return bcrypt.hashSync(pass, SALT_ROUNDS)
}

function hashCompare(pass, passCript){
    return bcrypt.compareSync(pass, passCript)
}

module.exports = { hashGenerator, hashCompare }
