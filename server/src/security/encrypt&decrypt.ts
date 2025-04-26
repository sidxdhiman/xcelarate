    const myCrypto = require('crypto');

    const algorithm = 'aes-256-cbc'
    const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'

    export const encrypt = (text:any) => {
        const iv = myCrypto.randomBytes(16)

        const cipher = myCrypto.createCipheriv(algorithm, secretKey, iv)

        const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

        return {
            iv: iv.toString('hex'),
            content: encrypted.toString('hex')
        }
    }
    export const decrypt = (hash:any) => {
        const decipher = myCrypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'))

        const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()])

        return decrypted.toString()
    }
