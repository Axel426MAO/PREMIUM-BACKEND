'use strict';

const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const path = require('path'); // 👈 1. Importe o módulo 'path'

fastify.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
});

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'uploads'),
  prefix: '/uploads/',
});

fastify.register(require('./plugins/prisma'));
fastify.register(require('@fastify/multipart'));

fastify.register(require('./modules/auth/auth.routes'), { prefix: '/api/auth' });
fastify.register(require('./modules/users/user.routes'), { prefix: '/api/users' });
fastify.register(require('./modules/books/books.routes'), { prefix: '/api/books' });
fastify.register(require('./modules/files/files.routes'), { prefix: '/api/files' });

module.exports = fastify;