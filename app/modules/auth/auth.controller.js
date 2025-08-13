// 📁 src/modules/auth/auth.controller.js
'use strict';

const AuthService = require('./auth.service');

class AuthController {
  async login(request, reply) {
    try {
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

  async verifyToken(request, reply) {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ error: 'Token de autenticação não fornecido ou mal formatado.' });
      }

      // Extrai o token do cabeçalho "Bearer <token>"
      const token = authHeader.split(' ')[1];

      const authService = new AuthService(request.server.prisma);
      const decodedToken = await authService.verifyToken(token);

      // Retorna o tipo de usuário para o frontend
      return reply.status(200).send({ userType: decodedToken.user_type });

    } catch (err) {
      request.log.error(`Falha na verificação do token: ${err.message}`);
      return reply.status(401).send({ error: err.message });
    }
  }
}

module.exports = new AuthController();
