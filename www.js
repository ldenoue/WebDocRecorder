'use strict';

/**
 * Module dependencies.
 */
var app = require('./app');
var debug = require('debug')('express:server');
var http = require('http');
var https = require('https');
var fs = require('fs');

var ports = [80,443];

/**
 * Create HTTP server.
 */

var redirectServer = http.createServer(app);

redirectServer.listen(ports[0]);

var server = https.createServer(
  {
    key: fs.readFileSync('./tls/key.pem'),
    cert: fs.readFileSync('./tls/cert.pem')
  },
  app
);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(ports[1]);

server.on('error', onError);
server.on('listening', onListening);

// [END server]

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error('requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error('is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
