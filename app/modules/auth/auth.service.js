// src/modules/auth/auth.service.js
'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'seu-segredo-super-secreto';

class AuthService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Altera o parâmetro "senha" para "password"
  async login({ email, password }) {
    // Altera o modelo para this.prisma.user
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.status) {
      throw new Error('Credenciais inválidas ou usuário inativo');
    }

    // Compara com user.password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Credenciais inválidas');
    }

    const payload = {
      id: user.id,
      email: user.email,
      // Altera o campo no payload para "user_type"
      user_type: user.user_type,
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
    return token;
  }
}

module.exports = AuthService;