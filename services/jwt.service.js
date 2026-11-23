require('dotenv').config()
const jwt = require('jsonwebtoken')

const CHAVE_SECRETA = process.env.JWT_SECRET
const EXPIRES_IN = process.env.JWT_EXPIRES_IN

function generateToken(payload){
    return jwt.sign(payload, CHAVE_SECRETA, {expiresIn: EXPIRES_IN})
}

function verifyToken(token){
    const normalizedToken = token.startsWith('Bearer ') ? token.slice(7) : token

    return jwt.verify(normalizedToken, CHAVE_SECRETA)
}

module.exports = { generateToken, verifyToken }
