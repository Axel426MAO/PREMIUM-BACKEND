'use strict';

const BookService = require('./books.service');

class BookController {
  // --- CREATE ---
  async create(request, reply) {
    try {
      const { title, pages, author, year_launch } = request.body;
      if (!title || !pages || !author || !year_launch) {
        return reply.status(400).send({ error: 'Campos obrigatórios: title, pages, author, year_launch.' });
      }
      const bookService = new BookService(request.server.prisma);
      const newBook = await bookService.create(request.body);
      return reply.status(201).send(newBook);
    } catch (err) {
      request.log.error(`Erro ao criar livro: ${err.message}`);
      return reply.status(500).send({ error: 'Ocorreu um erro interno ao criar o livro.' });
    }
  }

  // --- UPDATE ---
  async update(request, reply) {
    try {
      const { id } = request.params;
      const bookService = new BookService(request.server.prisma);
      const updatedBook = await bookService.update(id, request.body);
      return reply.send(updatedBook);
    } catch (err) {
      request.log.error(`Erro ao atualizar livro: ${err.message}`);
      // Erro comum do Prisma quando o registro a ser atualizado não é encontrado
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Livro não encontrado.' });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno ao atualizar o livro.' });
    }
  }

  // --- GET ALL ---
  async getAll(request, reply) {
    const bookService = new BookService(request.server.prisma);
    const books = await bookService.getAll();
    return reply.send(books);
  }

  // --- GET BY ID ---
  async getById(request, reply) {
    try {
      const { id } = request.params;
      const bookService = new BookService(request.server.prisma);
      const book = await bookService.getById(id);
      if (!book) {
        return reply.status(404).send({ error: 'Livro não encontrado.' });
      }
      return reply.send(book);
    } catch (err) {
      request.log.error(`Erro ao buscar livro por ID: ${err.message}`);
      return reply.status(500).send({ error: 'Ocorreu um erro interno.' });
    }
  }

  // --- DELETE ---
  async delete(request, reply) {
    try {
      const { id } = request.params;
      const bookService = new BookService(request.server.prisma);
      await bookService.delete(id);
      return reply.status(204).send(); // 204 No Content - sucesso, sem corpo na resposta
    } catch (err) {
      request.log.error(`Erro ao deletar livro: ${err.message}`);
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: 'Livro não encontrado.' });
      }
      return reply.status(500).send({ error: 'Ocorreu um erro interno ao deletar o livro.' });
    }
  }
}

module.exports = new BookController();
