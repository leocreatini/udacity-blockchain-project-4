# Udacity Blockchain Project 4

Build a Private Blockchain Notary Service

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

Example of a star coordinate:

```plain
RA 13h 03m 33.35sec, Dec -49° 31’ 38.1” Mag 4.83 Cen
```

| Method  | Route                       | Description                                    |
| ------- | --------------------------- | ---------------------------------------------- |
| POST    | /requestValidation          | Initiates a request to validate a star.        |
| POST    | /message-signature/validate | If valid, user can register a single star.     |
| POST    | /block                      | Add a new block to the blockchain.             |
| GET     | /stars/hash:[hash]          | Get information about star and its story.      |
| GET     | /stars/address:[address]    | Get information about stars and their story.   |
| GET     | /block/[height]             | Get information about star and its story.      |

### POST /requestValidation

A post request to start the process to register a new star to the blockchain.

You will receive a response like:

```json
{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "requestTimeStamp": "1532296090",
  "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
  "validationWindow": 300
}
```

You must then proceed to prove your blockchain identity within the 5 minute time window. See the next API endpoint [/message-signature/validate](#post-message-signature-validate) to learn how to complete this step.

### POST /message-signature/validate

Within the 5 minute window of initating the [/requestValidation](#post-requestValidation), you must send back your address and signature.

Post request body example:

```json
{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "signature": "H6ZrGrF0Y4rMGBMRT2+hHWGbThTIyhBS0dNKQRov9Yg6GgXcHxtO9GJN4nwD2yNXpnXHTWU9i+qdw5vpsooryLU="
}
```

JSON response example:

```json
{
  "registerStar": true,
  "status": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "requestTimeStamp": "1532296090",
    "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
    "validationWindow": 193,
    "messageSignature": "valid"
  }
}
```


### POST /block

This is to officially add a block to the chain. To make this work however, you will need to first [request validation](#post-requestValidation) and then [message back your signature to validate](#post-message-signature-validate).

Once approved, you need to provide your `address` and `star` object:

```json
{
  "address": "String",
  "star": {
    "ra": "String",
    "dec": "String",
    "cen": "String (optional)",
    "mag": "String (optional)"
  }
}
```

```json
{
  "address": "16VJNfcei1oBUDQfwdtWnmJcE5BSA6uogZ",
  "star": {
    "ra": "12h 53m 1.1s",
    "dec": "-55° 23' 21.9",
    "story": "Found a second star using https://www.google.com/sky/"
  }
}
```

And if valid, you should get a JSON response like so:

```json
{
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}
```

### GET /stars/hash:[hash]

Returns the block data that matches your hash, if it exists. The star story will be decoded as `decodedStory` within the `star` object.

### GET /stars/address:[address]

Returns an array of block data for the provided address, if said address has added blocks to the chain. The star stories will be decoded as `decodedStory` within the `star` object for each block.

### GET /block/[height]

Returns the block data with the height you request, if it exists. The star story will be decoded as `decodedStory` within the `star` object.


## Built With

- [ExpressJS](https://github.com/expressjs/express) - NodeJS Framework
- [NodeJS](https://nodejs.org/en/) - Serverside JavaScript (among other uses)
- [CryptoJS](https://github.com/brix/crypto-js) - JavaScript library of cryptography standards
- [bitcoinjs-message](https://github.com/bitcoinjs/bitcoinjs-message) - JavaScript library for signing and verifying bitcoin signatures.

## Authors

- **Leo Creatini** - [leocreatini](https://github.com/leocreatini)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- Udacity
