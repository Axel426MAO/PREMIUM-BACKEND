'use strict';

const bcrypt = require('bcrypt');

class UserService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async createUser({ email, password, user_type }) {
    if (!this.prisma) {
      throw new Error("Instância do Prisma não foi fornecida ao serviço.");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        user_type: user_type || 'default_user',
      },
    });
  }
  async getAllUsers() {
    if (!this.prisma) {
      throw new Error("Instância do Prisma não foi fornecida ao serviço.");
    }

    // Agora inclui o responsável e, para ele, a secretaria OU a escola vinculada
    return this.prisma.user.findMany({
      include: {
        responsible: {
          include: {
            secretary: true, // Inclui a secretaria, se houver
            school: true,    // Inclui a escola, se houver
          },
        },
      },
    });
  }
  async getUserById(id) {
    if (!this.prisma) {
      throw new Error("Instância do Prisma não foi fornecida ao serviço.");
    }
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: {
        responsible: { // Inclui os dados do responsável
          include: {
            secretary: true, // E a secretaria vinculada
            school: true,    // E a escola vinculada
          },
        },
      },
    });
  }


  async updateUser(id, { email, user_type, status, password }) {
    if (!this.prisma) {
      throw new Error("Instância do Prisma não foi fornecida ao serviço.");
    }
    const dataToUpdate = { email, user_type, status };
    // Se uma nova senha for fornecida, faz o hash dela
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async deleteUser(id) {
    if (!this.prisma) {
      throw new Error("Instância do Prisma não foi fornecida ao serviço.");
    }
    // Deleta em transação para garantir consistência
    return this.prisma.$transaction(async (prisma) => {
      // Deleta primeiro o responsável vinculado (se houver)
      await prisma.responsible.deleteMany({
        where: { user_id: id },
      });
      // Depois deleta o usuário
      return prisma.user.delete({
        where: { id },
      });
    });
  }

}

module.exports = UserService;
