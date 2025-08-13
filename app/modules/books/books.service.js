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
    const bookId = Number(id);

    // O $transaction garante que todas as operações aconteçam como um único bloco.
    // Se qualquer uma falhar, o Prisma desfaz todas as anteriores.
    return this.prisma.$transaction(async (prisma) => {
      // 1. Encontra os IDs de todos os lotes de licença associados ao livro.
      const licenseBatches = await prisma.licenseBatch.findMany({
        where: { book_id: bookId },
        select: { id: true },
      });
      const licenseBatchIds = licenseBatches.map(batch => batch.id);

      // 2. Deleta todas as chaves de licença (LicenseKey) que pertencem a esses lotes.
      // É preciso deletar os "netos" (LicenseKey) antes dos "filhos" (LicenseBatch).
      if (licenseBatchIds.length > 0) {
        await prisma.licenseKey.deleteMany({
          where: { batch_id: { in: licenseBatchIds } },
        });
      }

      // 3. Deleta todos os lotes de licença (LicenseBatch) associados ao livro.
      await prisma.licenseBatch.deleteMany({
        where: { book_id: bookId },
      });

      // 4. Deleta quaisquer arquivos (File) associados ao livro (ex: capa, PDF do livro).
      await prisma.file.deleteMany({
        where: {
          reference_table: 'books',
          reference_id: bookId,
        },
      });

      // 5. Finalmente, com todas as dependências removidas, deleta o livro.
      const deletedBook = await prisma.book.delete({
        where: { id: bookId },
      });

      return deletedBook;
    });
  }

}

module.exports = BookService;
