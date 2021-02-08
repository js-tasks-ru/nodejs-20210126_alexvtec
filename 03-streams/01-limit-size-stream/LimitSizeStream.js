const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.limit = options.limit;
    this.size = 0;
  }

  _transform(chunk, encoding, callback) {
    if (this.size + chunk.length > this.limit) {
      return callback(new LimitExceededError());
    }
    this.size += chunk.length;
    callback(null, chunk);
  }
}

module.exports = LimitSizeStream;
