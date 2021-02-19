const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':
      if (pathname.includes('/')) {
        res.statusCode = 400;
        return res.end(http.STATUS_CODES[400]);
      }

      fs.unlink(filepath, (err) => {
        if (err === null) {
          res.statusCode = 200;
          return res.end();
        }

        if (err.code === 'ENOENT') {
          res.statusCode = 404;
          return res.end(http.STATUS_CODES[404]);
        }

        res.statusCode = 500;
        return res.end(err);
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
