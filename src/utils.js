// global imports
const sha256 = require('crypto-js/sha256');
const bitcoinMessage = require('bitcoinjs-message');
const { BYTE_LIMIT } = require('./constants');

// utils
module.exports = {
  // creates a hash for given data. Returns a string.
  createHash: data => sha256(JSON.stringify(data)).toString(),

  encrypt: data => new Buffer(data).toString('hex'),
  
  decrypt: encoded => new Buffer(encoded, 'hex').toString(),

  decryptStarStory: block => block && block.body ? ({
    ...block,
    body: {
      ...block.body,
      star: {
        ...block.body.star,
        storyDecoded: new Buffer(block.body.star.story, 'hex').toString(),
      }
    }
  }) : block, // defensive coding

  getMessageInRequestsFromAddress: address => (acc, msg) => {
    // already found matching account, skip to end.
    if (acc.length > 0) { return acc; }
    // else, check address with one from this message
    const msgData = msg.split(':');
    if (msgData[0] === address) { return msg; }
    // else, nothing was found, keep passing default empty string
    return acc;
  },

  // gets a UTC date for the current time. Returns a string.
  getTimestamp: () => new Date().getTime().toString().slice(0,-3),

  getTimestampFromMessage: message => parseInt(message.split(':')[1], 10),

  validateSignature: ({ message, address, signature }) =>
    bitcoinMessage.verify(message, address, signature),

  removeMessage: message => msg => (msg !== message),
  
  removeAddress: address => item => (item.split(':')[0] !== address),

  checkRegistration: (mempool, address) =>
    mempool.filter(item => item.split(':')[0] === address).length > 0,

  checkAddress: adr =>
    (adr && typeof adr === 'string' && adr.length >= 26 && adr.length <= 50),

  checkString: str =>
    (str && typeof str === 'string' && str.length > 0),

  checkStar: star => (
    star && typeof star === 'object' && star.dec && star.ra &&
    star.story && Buffer.byteLength(star.story, 'utf8') <= BYTE_LIMIT // calculates byte size
  ),
};