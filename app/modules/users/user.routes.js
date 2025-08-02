// src/modules/users/user.routes.js
'use strict';

const userController = require('./user.controller');

async function userRoutes(fastify, options) {
  // Rota para criar um novo usuário
  fastify.post('/', userController.create);


}

module.exports = userRoutes;