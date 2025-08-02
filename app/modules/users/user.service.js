'use strict';

const bcrypt = require('bcrypt');

class UserService {
  // O construtor recebe a instância do Prisma
  constructor(prisma) {
    this.prisma = prisma;
  }

  async createUser({ email, password, user_type }) {
    // Agora `this.prisma` não será undefined
    if (!this.prisma) {
        throw new Error("Instância do Prisma não foi fornecida ao serviço.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        user_type: user_type || 'default_user', // Define um tipo padrão se não for fornecido
      },
    });

    return user;
  }

  async getAllUsers() {
    if (!this.prisma) {
        throw new Error("Instância do Prisma não foi fornecida ao serviço.");
    }
    // Exemplo de outro método
    return this.prisma.user.findMany({
        select: { // Seleciona campos para não expor a senha
            id: true,
            email: true,
            user_type: true,
            status: true,
            createdAt: true
        }
    });
  }
}

module.exports = UserService;
