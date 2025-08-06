'use strict';

class ResponsibleService {
  /**
   * @param {import('@prisma/client').PrismaClient} prisma
   */
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Cria um novo responsável, vinculando a um usuário e uma secretaria.
   * @param {object} data - Dados do responsável.
   * Exemplo: { name: '...', role: '...', user_id: 1, secretary_id: 1 }
   * @returns {Promise<import('@prisma/client').Responsible>}
   */
  async createResponsible(data) {
    const { name, role, whatsapp, phone, user_id, secretary_id } = data;

    if (!user_id || !secretary_id) {
      throw new Error('user_id e secretary_id são obrigatórios.');
    }

    // O Prisma já vai validar se o user_id e secretary_id existem por causa da relation.
    // O `connect` lança P2025 se o ID relacionado não for encontrado.
    return this.prisma.responsible.create({
      data: {
        name,
        role,
        whatsapp,
        phone,
        user: {
          connect: { id: user_id },
        },
        secretary: {
          connect: { id: secretary_id },
        },
      },
      include: {
        user: {
            select: { id: true, email: true, status: true } // Não expor a senha
        },
        secretary: true
      }
    });
  }

  /**
   * Retorna todos os responsáveis.
   * @returns {Promise<import('@prisma/client').Responsible[]>}
   */
  async getAllResponsibles() {
    return this.prisma.responsible.findMany({
      include: {
        user: {
            select: { id: true, email: true, status: true }
        },
        secretary: {
            include: { address: true }
        },
      },
    });
  }

  /**
   * Busca um responsável por ID.
   * @param {number} id
   * @returns {Promise<import('@prisma/client').Responsible>}
   */
  async getResponsibleById(id) {
    return this.prisma.responsible.findUniqueOrThrow({
      where: { id },
      include: {
        user: {
            select: { id: true, email: true, status: true }
        },
        secretary: {
            include: { address: true }
        },
      },
    });
  }

  /**
   * Atualiza um responsável por ID.
   * @param {number} id
   * @param {object} data
   * @returns {Promise<import('@prisma/client').Responsible>}
   */
  async updateResponsible(id, data) {
    const { name, role, whatsapp, phone, user_id, secretary_id } = data;
    return this.prisma.responsible.update({
      where: { id },
      data: {
        name,
        role,
        whatsapp,
        phone,
        user_id,
        secretary_id,
      },
       include: {
        user: {
            select: { id: true, email: true, status: true }
        },
        secretary: true
      }
    });
  }

  /**
   * Deleta um responsável por ID.
   * @param {number} id
   * @returns {Promise<import('@prisma/client').Responsible>}
   */
  async deleteResponsible(id) {
    // Garante que o responsável existe antes de tentar deletar
    await this.getResponsibleById(id);
    return this.prisma.responsible.delete({
      where: { id },
    });
  }
}

module.exports = ResponsibleService;
