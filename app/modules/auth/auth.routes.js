// 📁 src/modules/auth/auth.routes.js
'use strict';

const authController = require('./auth.controller');

async function authRoutes(fastify, options) {
  // Rota de login existente (sem alterações)
  fastify.post('/login', authController.login);

  // ROTA CORRIGIDA: Alterado de POST para GET
  fastify.get('/verify-token', {
    handler: authController.verifyToken
  });
}

module.exports = authRoutes;
