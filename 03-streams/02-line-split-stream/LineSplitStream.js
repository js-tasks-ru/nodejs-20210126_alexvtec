const stream = require('stream');
const os = require('os');

const newLineCharCode = os.EOL.charCodeAt(0);

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.symbols = [];
  }

  sendSymbols() {
    const buf = Buffer.from(this.symbols);
    this.push(buf);
    this.symbols = [];
  }

  _transform(chunk, encoding, callback) {
    for (const key of chunk.keys()) {
      const symbolCode = chunk[key];

      if (symbolCode === newLineCharCode) {
        this.sendSymbols();
        continue;
      }

      this.symbols.push(symbolCode);
    }

    callback(null);
  }

  _flush(callback) {
    if (this.symbols.length !== 0) {
      this.sendSymbols();
    }
    callback(null);
  }
}

module.exports = LineSplitStream;
