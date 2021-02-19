const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const LimitSizeStream = require('./LimitSizeStream');
const LimitExceededError = require('./LimitExceededError');

const MAX_FILE_SIZE_BYTES = 1000000;

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      if (pathname.includes('/')) {
        res.statusCode = 400;
        return res.end(http.STATUS_CODES[400]);
      }

      const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});
      const limitStream = new LimitSizeStream({limit: MAX_FILE_SIZE_BYTES});

      req
          .on('error', (e) => {
            // Handle connection reset
            if (e.code === 'ECONNRESET') {
              fs.unlink(filepath, (err) => {
                if (err) {
                  // Log error into system, that file was not deleted
                  console.log(err);
                }
              });
            }
          })
          .pipe(limitStream)
          .on('error', (e) => {
            // Handle exceeding the limit
            if (e instanceof LimitExceededError) {
              fs.unlink(filepath, (err) => {
                if (err) {
                  // Log error into system, that file was not deleted
                  console.log(err);
                }
              });
              res.statusCode = 413;
              return res.end(http.STATUS_CODES[413]);
            }
          })
          .pipe(writeStream)
          .on('finish', () => {
            // Handle successfully created file
            res.statusCode = 201;
            return res.end(http.STATUS_CODES[201]);
          })
          .on('abort', () => {
            // Handle connection abort
            fs.unlink(filepath, (err) => {
              if (err) {
                // Log error into system, that file was not deleted
                console.log(err);
              }
            });
          })
          .on('error', (e) => {
            // Handle existing file
            if (e.code === 'EEXIST') {
              res.statusCode = 409;
              return res.end(http.STATUS_CODES[409]);
            }
            // Handle other exceptions
            res.statusCode = 500;
            return res.end(http.STATUS_CODES[500]);
          });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
