const stream = require('stream');
const os = require('os');

const newLineCharCode = os.EOL.charCodeAt(0);

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    let index = 0;

    for (const symbols of chunk.entries()) {
      const [idx, sym] = symbols;
      if (sym === newLineCharCode) {
        this.push(chunk.slice(index, idx));
        index += 1;
      }

      if (idx === chunk.length - 1) {
        this.push(chunk.slice(idx));
      }
    }

    callback(null);
  }

  _flush(callback) {
    callback(null);
  }
}

module.exports = LineSplitStream;
