// bring in the imports, pump up the jam
const express = require('express');
const bodyparser = require('body-parser');

// local imports
const { BAD_REQUEST, SERVER_STARTED } = require('./constants');

// constants
const DEFAULT_CONFIG = {
  port: 8000,
};

class App {
  // setup server instance
  constructor(config) {
    return (async() => {
      this.config = config || DEFAULT_CONFIG;
      this.initServer();
      this.initMiddleware();
      await this.initRoutes();
      this.start();
      return this;
    })();
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
  async initRoutes() {
    await require('./BlockController')(this.app);

    // setup default catch-all for bad requests
    this.app.get('*', (req, res) => res.json(BAD_REQUEST));
  }

  // start server
  start() {
    this.app.listen(this.config.port, console.log(`${SERVER_STARTED}${this.config.port}`));
  }
}

exports.App = App;
