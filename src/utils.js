// global imports
const sha256 = require('crypto-js/sha256');

// utils
module.exports = {
  // creates a hash for a given block. Returns a string.
  createHash: block => sha256(JSON.stringify(block)).toString(),
  
  // gets a UTC date for the current time. Returns a string.
  getTimestamp: () => new Date().getTime().toString().slice(0,-3),
};