const { Block } = require('./Block');
const { Database } = require('./Database');
const {
  DB_LOCATION,
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
  getMessageInRequestsFromAddress,
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
    return (async () => {
      this.app = app;
      this.chain = await new Database(`${DB_LOCATION}/chain`);
      this.mempool = await new Database(`${DB_LOCATION}/mempool`);;
      this.requests = await new Database(`${DB_LOCATION}/requests`);;
      await this.initBlockchain();
      this.getBlockByHash();
      this.getBlocksByAddress();
      this.getBlockByHeight();
      this.requestValidation();
      this.messageSignatureValidation();
      this.postNewBlock();
      return this;
    })();
  }

  // GET Endpoint to retrieve a block by hash, url: '/api/stars/hash:hash'
  getBlockByHash() {
    this.app.get('/stars/hash::hash', async (req, res) => {
      const { hash } = req.params;
      // hash is good
      if (checkString(hash)) {
        try {
        // search through blockchain, add any blocks with matching address to total.
        const chainData = await this.chain.getData();
          const block = chainData.filter(({ value }) => (value.hash === hash))[0].value;
          // block with hash was found
          if (block) {
            return res.json(decryptStarStory(block));
          }
          throw new Error('Block not found.');
        } catch (error) {
          // no blocks were found
          return res.json({
            status: false,
            message: `Error: Blockchain doesn't have a block with hash of ${hash}.`
          });
        }
      }
      // address is junk or missing
      return res.json(INVALID_REQUEST);
    });
  }

  // GET Endpoint to retrieve a blocks by address, url: '/api/stars/address:address'
  getBlocksByAddress() {
    this.app.get('/stars/address::address', async (req, res) => {
      const { address } = req.params;
      // ensure address is valid
      if (checkAddress(address)) {
        try {
          // search through blockchain, add any blocks with matching address to total.
          const chainData = await this.chain.getFormattedData();
          const blocks = chainData.reduce((total, block) =>
            (block && block.body && block.body.address === address) 
            ? [...total, block]
            : total,
            []
          );
          // blocks with address were found
          if (blocks.length > 0) {
            const decodedBlocks = blocks.map(block => decryptStarStory(block));
            return res.json(decodedBlocks);
          }
          throw new Error('No blocks found');
        } catch (error) {
          // no blocks were found
          return res.json({
            status: false,
            message: `Error: Blockchain doesn't have any blocks with address of ${address}.`
          });
        }
      }
      // address is junk or missing
      return res.json(INVALID_REQUEST);
    });
  }

  // GET Endpoint to retrieve a block by height, url: '/api/block/:height'
  getBlockByHeight() {
    this.app.get('/block/:height', async (req, res) => {
      const { height } = req.params;
      try {
        const block = await this.chain.getValue(height);
        // height is good
        if (block) {
          return res.json(decryptStarStory(block));
        }
        throw new Error('Block not found');
      } catch (error) {
        // height is junk or missing
        return res.json({
          status: false,
          message: `Error: Blockchain doesn't have a block with height of ${height}.`
        });
      }
    });
  }

  requestValidation() {
    this.app.post('/requestValidation', async (req, res) => {
      const { address } = req.body;

      const makeNewRequest = async () => {
        const requestTimestamp = getTimestamp();
        const validationWindow = REQUEST_VALIDATION_TIMELIMIT; // 300 seconds; 5 minutes
        const message = `${address}:${requestTimestamp}:starRegistry`;

        // save id and timestamp
        await this.requests.push(message);

        return res.json({ address, requestTimestamp, message, validationWindow });
      };

      if (checkAddress(address)) {
        // find request by address.
        const requests = await this.requests.getFormattedData();
        const message = requests.reduce(getMessageInRequestsFromAddress(address), '');

        // a current request for validation exists
        if (message) {
          const requestTimestamp = message.split(':')[1];
          const validationWindow = REQUEST_VALIDATION_TIMELIMIT - (getTimestamp() - parseInt(requestTimestamp, 10));

          // there is still time
          if (validationWindow > 0) {
            return res.json({ address, requestTimestamp, message, validationWindow }); 
          }
          // else, no current request is saved.
          await this.requests.filterOut(message);
          return makeNewRequest();
        }
        return makeNewRequest();
      }
      return res.json(INVALID_REQUEST);
    });
  }

  messageSignatureValidation() {
    this.app.post('/message-signature/validate', async (req, res) => {
      const { address, signature } = req.body;
      if (checkAddress(address) && checkString(signature)) {
        // find request by address.
        const requests = await this.requests.getFormattedData();
        const message = requests.reduce(getMessageInRequestsFromAddress(address), '');

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
          
          await this.requests.filterOut(message);
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
  
  // POST Endpoint to add a new Block, url: '/api/block'
  postNewBlock() {
    this.app.post('/block', async (req, res) => {
      const { address, star } = req.body;
      // check to see if request data is good
      if (checkAddress(address) && checkStar(star)) {
        // check to see if validation is good
        const mempool = await this.mempool.getFormattedData();
        if (checkRegistration(mempool, address)) {
          // remove message from mempool by its address
          const message = mempool.reduce(getMessageInRequestsFromAddress(address), '');
          await this.mempool.filterOut(message);
          // create new block
          const block = await this.createBlock({ address, star });
          // add block to the chain
          await this.addBlock(block);
          // send back new block to requester
          return res.json({ ...block });
        }
        return res.json(INVALID_NEW_BLOCK_REQUEST);
      }
      // when data is junk or missing
      return res.json(INVALID_NEW_BLOCK_DATA);
    });
  }

  // creates new block
  // configures it based on the current chain
  // and then returns the block
  async createBlock({ address, star }) {
    const payload = star
      ? { address, star: { ...star, story: encrypt(star.story) } }
      : null;
    // make block
    const block = new Block(payload);
    // set height
    const chainData = await this.chain.getData(); // length is already height + 1
    block.height = chainData.length;
    // set previous block hash (if not the genesis block)
    if (chainData.length > 0) {
      block.previousBlockHash = chainData[chainData.length - 1].hash;
    }
    // set hash
    block.hash = createHash(block);
    // return block to initiator
    return block;
  }

  // add block to chain
  async addBlock(block) {
    await this.chain.push(block);
    return block;
  }

  // make genesis block
  async initBlockchain() {
    const chainData = await this.chain.getData();
    if (chainData.length === 0) {
      const genesisBlock = await this.createBlock(GENESIS_BLOCK_DATA);
      await this.addBlock(genesisBlock);
    }
  }
}

module.exports = (app) => new BlockController(app);