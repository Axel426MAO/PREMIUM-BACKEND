'use strict';

const UserService = require('./user.service');

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
}

module.exports = new UserController();
