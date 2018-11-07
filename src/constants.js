// constants
exports.BAD_REQUEST = {
  status: false,
  message: 'You may be missing information in your request. Please check your request URL and METHOD, and try again.'
};

exports.INVALID_NEW_BLOCK_REQUEST = {
  status: false,
  message: 'Error: Invalid new block request. Ensure you have an approved validation request and is under the 5 minute time limit.',
};

exports.INVALID_NEW_BLOCK_DATA = {
  status: false,
  message: 'Error: Invalid new block request. Ensure that your address and star data are correct.',
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
  message: 'Error: Signature is invalid. Duplicate attempts with an approved signature will result in error.',
};

exports.EXCEEDED_TIME_LIMIT = {
  registerStar: false,
  status: false,
  message: 'Error: Exceeded time limit.',
};

exports.SERVER_STARTED = "Things are happening on http://localhost:";

// junk info, no security issue. glhf
exports.GENESIS_BLOCK_DATA = {
  // address: '',
};

exports.REQUEST_VALIDATION_TIMELIMIT = 300; // 300 seconds; 5 minutes

exports.BYTE_LIMIT = 500; // size limit for star story

exports.DB_LOCATION = './data';
