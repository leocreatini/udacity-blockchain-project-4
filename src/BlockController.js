const { Block } = require('./Block');
const {
  INVALID_NEW_BLOCK_REQUEST,
  GENESIS_BLOCK_DATA,
  INVALID_REQUEST,
  REQUEST_VALIDATION_TIMELIMIT,
  ACCOUNT_NOT_FOUND,
  INVALID_SIGNATURE,
  EXCEEDED_TIME_LIMIT,
} = require('./constants');
const {
  createHash,
  encrypt,
  decryptStarStory,
  getTimestamp,
  getTimestampFromMessage,
  validateSignature,
  removeMessage,
  removeAddress,
  checkAddress,
  checkString,
  checkRegistration,
  checkStar,
} = require('./utils');

// Controller to encapsulate routes to work with blocks
class BlockController {
  constructor(app) {
    this.app = app;
    this.chain = [];
    this.mempool = [];
    this.requests = [];
    this.initBlockchain();
    this.getBlockByHash();
    this.getBlocksByAddress();
    this.getBlockByHeight();
    this.requestValidation();
    this.messageSignatureValidation();
    this.postNewBlock();
  }

  // GET Endpoint to retrieve a block by hash, url: '/api/stars/hash:hash'
  getBlockByHash() {
    this.app.get('/stars/hash::hash', (req, res) => {
      const { hash } = req.params;
      // hash is good
      if (checkString(hash)) {
        // search through blockchain, add any blocks with matching address to total.
        const block = this.chain.filter(block => (block.hash === hash))[0];
        // block with hash was found
        if (block) {
          return res.json(decryptStarStory(block));
        }
        // no blocks were found
        return res.json({
          status: false,
          message: `Error: Blockchain doesn't have a block with hash of ${hash}.`
        });
      }
      // address is junk or missing
      return res.json(INVALID_REQUEST);
    });
  }

  // GET Endpoint to retrieve a blocks by address, url: '/api/stars/address:address'
  getBlocksByAddress() {
    this.app.get('/stars/address::address', (req, res) => {
      const { address } = req.params;
      // ensure address is valid
      if (checkAddress(address)) {
        // search through blockchain, add any blocks with matching address to total.
        const blocks = this.chain.reduce((total, block) =>
          (block.body.address === address) 
          ? [...total, block]
          : total,
          []
        );
        // blocks with address were found
        if (blocks.length > 0) {
          const decodedBlocks = blocks.map(block => decryptStarStory(block));
          return res.json(decodedBlocks);
        }
        // no blocks were found
        return res.json({
          status: false,
          message: `Error: Blockchain doesn't have any blocks with address of ${address}.`
        });
      }
      // address is junk or missing
      return res.json(INVALID_REQUEST);
    });
  }

  // GET Endpoint to retrieve a block by height, url: '/api/block/:height'
  getBlockByHeight() {
    this.app.get('/block/:height', (req, res) => {
      const { height } = req.params;
      const block = this.chain[height];
      // height is good
      if (block) {
        return res.json(decryptStarStory(block));
      }
      // height is junk or missing
      return res.json({
        status: false,
        message: `Error: Blockchain doesn't have a block with height of ${height}.`
      });
    });
  }

  // POST Endpoint to add a new Block, url: '/api/block'
  postNewBlock() {
    this.app.post('/block', (req, res) => {
      const { address, star } = req.body;
      // check to see if request is good
      if (
        checkAddress(address) &&
        checkStar(star) &&
        checkRegistration(this.mempool, address)
      ) {
        // remove message from mempool by its address
        this.mempool = this.mempool.filter(removeAddress(address));
        // create new block
        const block = this.createBlock({ address, star });
        // add block to the chain
        this.addBlock(block);
        // send back new block to requester
        return res.json({ ...block });
      }
      // when data is junk or missing
      return res.json(INVALID_NEW_BLOCK_REQUEST);
    });
  }

  requestValidation() {
    this.app.post('/requestValidation', (req, res) => {
      const { address } = req.body;
      if (checkAddress(address)) {
        const requestTimestamp = getTimestamp();
        const validationWindow = REQUEST_VALIDATION_TIMELIMIT; // 300 seconds; 5 minutes
        const message = `${address}:${requestTimestamp}:starRegistry`;

        // save id and timestamp
        this.requests.push(message);

        return res.json({ address, requestTimestamp, message, validationWindow }); 
      }
      return res.json(INVALID_REQUEST);
    });
  }

  messageSignatureValidation() {
    this.app.post('/message-signature/validate', (req, res) => {
      const { address, signature } = req.body;
      if (checkAddress(address) && checkString(signature)) {
        // find request by address.
        const message = this.requests.reduce((acc, msg) => {
          // already found matching account, skip to end.
          if (acc.length > 0) { return acc; }
          // else, check address with one from this message
          const msgData = msg.split(':');
          if (msgData[0] === address) { return msg; }
          // else, nothing was found, keep passing default empty string
          return acc;
        }, '');

        // account not found
        if (message.length === 0) {
          return res.json(ACCOUNT_NOT_FOUND);
        }

        // check time left
        const currentTime = getTimestamp();
        const requestTimeStamp = getTimestampFromMessage(message);
        const timeDiff = currentTime - requestTimeStamp;
        const validationWindow = REQUEST_VALIDATION_TIMELIMIT - timeDiff;
        if (validationWindow <= 0) {
          return res.json(EXCEEDED_TIME_LIMIT);
        }

        // validate signature
        const isSignatureValid = validateSignature({ address, message, signature });
        // signature is valid
        if (isSignatureValid) {
          // remove message from mempool
          this.requests = this.requests.filter(removeMessage(message));
          // add to mempool (approved for adding to blockchain)
          this.mempool.push(message);
          return res.json({
            registerStar: true,
            status: {
              address,
              requestTimeStamp,
              validationWindow,
              messageSignature: 'valid',
            },
          });
        }
        // else, signature is crap
        return res.json(INVALID_SIGNATURE);
      }
      return res.json(INVALID_REQUEST);
    });
  }
  
  // creates new block
  // configures it based on the current chain
  // and then returns the block
  createBlock({ address, star }) {
    // hash story, reduce block size
    const story = encrypt(star.story);
    // make block
    const block = new Block({ address, star: { ...star, story } });
    // set height
    block.height = this.chain.length; // length is already height + 1
    // set previous block hash (if not the genesis block)
    if (this.chain.length > 0) {
      block.previousBlockHash = this.chain[this.chain.length - 1].hash;
    }
    // set hash
    block.hash = createHash(block);
    // return block to initiator
    return block;
  }

  // add block to chain
  addBlock(block) {
    this.chain.push(block);
    return block;
  }

  // make genesis block
  initBlockchain() {
    if (this.chain.length === 0) {
      const genesisBlock = this.createBlock(GENESIS_BLOCK_DATA);
      this.addBlock(genesisBlock);
    }
  }
}

module.exports = (app) => new BlockController(app);