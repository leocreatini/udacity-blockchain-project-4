// constants
exports.BAD_REQUEST = {
  status: false,
  message: 'You may be missing information in your request. Please check your request URL and METHOD, and try again.'
};

exports.INVALID_NEW_BLOCK_REQUEST = {
  status: false,
  message: 'Error: Invalid new block request. Ensure you have an approved validation request, and that your address and star data are correct.',
};

exports.INVALID_REQUEST = {
  status: false,
  message: 'Error: Invalid request, please check your request body data is correct.',
};

exports.ACCOUNT_NOT_FOUND = {
  registerStar: false,
  status: false,
  message: 'Error: Could not find a request for validation for this account.',
};

exports.INVALID_SIGNATURE = {
  registerStar: false,
  status: false,
  message: 'Error: Signature is invalid.',
};

exports.EXCEEDED_TIME_LIMIT = {
  registerStar: false,
  status: false,
  message: 'Error: Exceeded time limit.',
};

exports.SERVER_STARTED = "Things are happening on http://localhost:";

// junk info, no security issue. glhf
exports.GENESIS_BLOCK_DATA = {
  address: '142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ',
  star: {
    ra: '12h 24m 7.0s',
    dec: "-22° 24' 24.9",
    story: 'The sun is trying to kill me',
  },
};

exports.REQUEST_VALIDATION_TIMELIMIT = 300; // 300 seconds; 5 minutes
