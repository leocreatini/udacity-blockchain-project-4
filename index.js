// bring in the imports, pump up the jam
const express = require('express');
const bodyparser = require('body-parser');

// local imports
const { BAD_REQUEST, SERVER_STARTED } = require('./src/constants');

// constants
const DEFAULT_CONFIG = {
  port: 8000,
};

class BlockchainApp {
  // setup server instance
  constructor(config) {
    this.config = config || DEFAULT_CONFIG;
    this.initServer();
    this.initMiddleware();
    this.initRoutes();
    this.start();
  }

  // make express app
  initServer() {
    this.app = express();
  }

  // add middleware for app
  initMiddleware() {
    this.app.use(bodyparser.urlencoded({ extended: true }));
    this.app.use(bodyparser.json());
  }

  // connect routes to app
  initRoutes() {
    require('./src/BlockController')(this.app);

    // setup default catch-all for bad requests
    this.app.get('*', (req, res) => res.json(BAD_REQUEST));
  }

  // start server
  start() {
    this.app.listen(this.config.port, console.log(`${SERVER_STARTED}${this.config.port}`));
  }
}

new BlockchainApp();
