'use strict';

const UserService = require('./user.service');

class UserController {
  async create(request, reply) {
    try {
      // Validação básica do corpo da requisição
      if (!request.body || !request.body.email || !request.body.password) {
        return reply.status(400).send({ error: 'Email e password são obrigatórios.' });
      }
      
      // PONTO-CHAVE DA CORREÇÃO:
      // Crie a instância do serviço passando o cliente Prisma.
      const userService = new UserService(request.server.prisma);
      
      const newUser = await userService.createUser(request.body);
      
      // Remove a senha da resposta por segurança
      const { password, ...userResponse } = newUser;

      return reply.status(201).send(userResponse);
    } catch (err) {
      request.log.error(`Erro ao criar usuário: ${err.message}`);
      // Verifica se é um erro de duplicidade do Prisma
      if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
          return reply.status(409).send({ error: 'Este email já está em uso.' });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno ao criar o usuário.' });
    }
  }

  // Adicione outros métodos do controller aqui (getAll, getById, etc.)
  // Lembre-se de sempre instanciar o serviço passando o prisma.
  // Exemplo:
  async getAll(request, reply) {
      const userService = new UserService(request.server.prisma);
      const users = await userService.getAllUsers();
      return reply.send(users);
  }
}

module.exports = new UserController();
