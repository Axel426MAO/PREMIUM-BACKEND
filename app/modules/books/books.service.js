'use strict';

class BookService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Cria um novo livro no banco de dados.
   * @param {object} bookData - Objeto contendo todos os dados do livro.
   */
  async create(bookData) {
    return this.prisma.book.create({
      data: bookData,
    });
  }


  async getAll() {
    return this.prisma.book.findMany();
  }

  /**
   * Busca um livro pelo ID.
   * @param {string} id - O ID do livro a ser buscado.
   */
  async getById(id) {
    return this.prisma.book.findUnique({
      where: { id: Number(id) },
    });
  }

  /**
   * Atualiza um livro existente.
   * @param {string} id - O ID do livro a ser atualizado.
   * @param {object} bookData - Os dados a serem atualizados.
   */
  async update(id, bookData) {
    return this.prisma.book.update({
      where: { id: Number(id) },
      data: bookData,
    });
  }

  /**
   * Deleta um livro pelo ID.
   * @param {string} id - O ID do livro a ser deletado.
   */
  async delete(id) {
    return this.prisma.book.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = BookService;
