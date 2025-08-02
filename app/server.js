// src/server.js
'use strict';

const app = require('./app');
const { port } = require('./config');

const start = async () => {
  try {
    await app.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();