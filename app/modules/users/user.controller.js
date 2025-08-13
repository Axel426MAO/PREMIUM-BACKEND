'use strict';

const UserService = require('./user.service');
const crypto = require('crypto');
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return str;
}
class UserController {
  async create(request, reply) {
    try {
      if (!request.body || !request.body.email || !request.body.password) {
        return reply.status(400).send({ error: 'Email e password são obrigatórios.' });
      }
      const userService = new UserService(request.server.prisma);
      const newUser = await userService.createUser(request.body);
      const { password, ...userResponse } = newUser;
      return reply.status(201).send(userResponse);
    } catch (err) {
      request.log.error(`Erro ao criar usuário: ${err.message}`);
      if (err.code === 'P2002') {
        return reply.status(409).send({ error: 'Este email já está em uso.' });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }



  async getAll(request, reply) {
    try {
      const userService = new UserService(request.server.prisma);
      const users = await userService.getAllUsers();
      // Remove a senha da resposta por segurança
      const usersWithoutPassword = users.map(({ password, ...user }) => user);
      return reply.send(usersWithoutPassword);
    } catch (err) {
      request.log.error(`Erro ao buscar usuários: ${err.message}`);
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }

  async getById(request, reply) {
    try {
      const { id } = request.params;
      const userService = new UserService(request.server.prisma);
      const user = await userService.getUserById(Number(id));
      const { password, ...userResponse } = user;
      return reply.send(userResponse);
    } catch (err) {
      request.log.error(`Erro ao buscar usuário: ${err.message}`);
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Usuário não encontrado.' });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }

  async update(request, reply) {
    try {
      const { id } = request.params;
      const userService = new UserService(request.server.prisma);
      const updatedUser = await userService.updateUser(Number(id), request.body);
      const { password, ...userResponse } = updatedUser;
      return reply.send(userResponse);
    } catch (err) {
      request.log.error(`Erro ao atualizar usuário: ${err.message}`);
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Usuário não encontrado.' });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }

  async delete(request, reply) {
    try {
      const { id } = request.params;
      const userService = new UserService(request.server.prisma);
      await userService.deleteUser(Number(id));
      return reply.status(204).send();
    } catch (err) {
      request.log.error(`Erro ao deletar usuário: ${err.message}`);
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Usuário não encontrado.' });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }

  async getMe(request, reply) {
    // Use o mesmo segredo que você usa para criar o token no login
    const JWT_SECRET = '99746510Gg@';

    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ error: 'Token de autenticação não fornecido ou malformado.' });
      }
      const token = authHeader.split(' ')[1];

      // 2. Separe o token em suas três partes
      const [headerB64, payloadB64, signatureB64] = token.split('.');
      if (!headerB64 || !payloadB64 || !signatureB64) {
        return reply.status(401).send({ error: 'Token JWT inválido.' });
      }

      // 3. Verifique a assinatura (passo de segurança crucial)
      const signatureInput = `${headerB64}.${payloadB64}`;
      const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(signatureInput)
        .digest('base64url'); // Use base64url para compatibilidade

      if (expectedSignature !== signatureB64) {
        request.log.warn('Falha na verificação da assinatura do JWT.');
        return reply.status(401).send({ error: 'Token inválido ou assinatura incorreta.' });
      }

      // 4. Decodifique o payload para obter os dados
      const payloadJson = Buffer.from(base64UrlDecode(payloadB64), 'base64').toString('utf8');
      const decodedPayload = JSON.parse(payloadJson);

      // Verifique se o token expirou (se você incluiu 'exp' na criação)
      if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
        return reply.status(401).send({ error: 'Token expirado.' });
      }

      // 5. Obtenha o ID do usuário e busque no banco
      const userId = decodedPayload.id;
      if (!userId) {
        return reply.status(401).send({ error: 'Token inválido: ID do usuário não encontrado.' });
      }

      const userService = new UserService(request.server.prisma);
      const user = await userService.getUserById(userId);

      const { password, ...userResponse } = user;
      return reply.send(userResponse);

    } catch (err) {
      // Captura erros de JSON.parse, banco de dados, etc.
      request.log.error(`Erro ao processar token ou buscar usuário: ${err.message}`);
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }

}

module.exports = new UserController();
