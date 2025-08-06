'use strict';

class AddressService {
  /**
   * @param {import('@prisma/client').PrismaClient} prisma
   */
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Cria um novo endereço no banco de dados.
   * @param {object} data - Dados do endereço.
   * @returns {Promise<import('@prisma/client').Address>}
   */
  async createAddress(data) {
    const { street, number, neighborhood, city, state, cep } = data;
    return this.prisma.address.create({
      data: {
        street,
        number,
        neighborhood,
        city,
        state,
        cep,
      },
    });
  }

  /**
   * Retorna todos os endereços.
   * @returns {Promise<import('@prisma/client').Address[]>}
   */
  async getAllAddresses() {
    return this.prisma.address.findMany();
  }

  /**
   * Busca um endereço por ID.
   * @param {number} id
   * @returns {Promise<import('@prisma/client').Address>}
   */
  async getAddressById(id) {
    return this.prisma.address.findUniqueOrThrow({
      where: { id },
    });
  }

  /**
   * Atualiza um endereço por ID.
   * @param {number} id
   * @param {object} data
   * @returns {Promise<import('@prisma/client').Address>}
   */
  async updateAddress(id, data) {
    const { street, number, neighborhood, city, state, cep } = data;
    return this.prisma.address.update({
      where: { id },
      data: {
        street,
        number,
        neighborhood,
        city,
        state,
        cep,
      },
    });
  }

  /**
   * Deleta um endereço por ID.
   * @param {number} id
   * @returns {Promise<import('@prisma/client').Address>}
   */
  async deleteAddress(id) {
    // Garante que o endereço existe antes de tentar deletar
    await this.getAddressById(id);
    return this.prisma.address.delete({
      where: { id },
    });
  }
}

module.exports = AddressService;
     