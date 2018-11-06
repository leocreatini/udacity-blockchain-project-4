const bitcoinMessage = require('bitcoinjs-message');

const [message, privateKey] = process.argv;

const signature = bitcoinMessage.sign(message, privateKey);

console.log(signature.toString());