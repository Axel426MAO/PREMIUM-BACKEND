// src/modules/auth/auth.controller.js
'use strict';

const AuthService = require('./auth.service');

class AuthController {
  async login(request, reply) {
    try {
      // Validação básica para garantir que o corpo da requisição não está vazio
      if (!request.body || !request.body.email || !request.body.password) {
        return reply.status(400).send({ error: 'Email e password são obrigatórios.' });
      }
      
      const authService = new AuthService(request.server.prisma);
      const token = await authService.login(request.body);
      
      return reply.status(200).send({ message: 'Login bem-sucedido', token });
    } catch (err) {
      request.log.error(`Falha no login para ${request.body.email}: ${err.message}`);
      return reply.status(401).send({ error: err.message });
    }
  }
}

module.exports = new AuthController();