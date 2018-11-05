# Udacity Blockchain Project 3

Build an API to get block info and add a new block to the chain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You will need NodeJS and NPM, you can [download it here](https://nodejs.org/en/download/).

```json
"engines": {
  "node": ">8"
}
```

### Installing

Begin by downloading dependencies and setting up the app with:

```bash
yarn
```

OR

```bash
npm install
```

### Using

To start the server and to be able to interact with the API, run:

```bash
yarn start
```

OR

```bash
npm start
```

### Testing

Open browser to [http://localhost:8000/block/0](http://localhost:8000/block/0) to see the 0th block information. You can then replace the "0" with any other positive integer that's equal or less than the current block height.

You can use [Postman](https://www.getpostman.com/) to send GET or POST requests to test the API's functionality. Please refer to the API docs below.

## API

All data is in JSON format, and expects body for POST to be in JSON as well.

| Method  | Route          | Description                                    |
| ------- | -------------- | ---------------------------------------------- |
| GET     | /block/:index  | Get information of a single block.             |
| POST    | /block         | Add a new block to the blockchain.             |

### Requirements

- When fetching details on a block, the `index` must be included.
- When adding a new block, you must pass a JSON object using the key, `data`, with a string value.

## Built With

- [ExpressJS](https://github.com/expressjs/express) - NodeJS Framework
- [NodeJS](https://nodejs.org/en/) - Serverside JavaScript (among other uses)
- [CryptoJS](https://github.com/brix/crypto-js) - JavaScript library of cryptography standards

## Authors

- **Leo Creatini** - [leocreatini](https://github.com/leocreatini)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- Udacity
