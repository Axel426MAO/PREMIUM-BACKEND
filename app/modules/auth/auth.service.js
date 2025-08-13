// 📁 src/modules/auth/auth.service.js
'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = '99746510Gg@';

class AuthService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async login({ email, password }) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.status) {
      throw new Error('Credenciais inválidas ou usuário inativo');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Credenciais inválidas');
    }

    const payload = {
      id: user.id,
      email: user.email,
      user_type: user.user_type,
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
    return token;
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, jwtSecret);
      return decoded;
    } catch (err) {
      throw new Error('Token inválido ou expirado.');
    }
  }
}

module.exports = AuthService;
