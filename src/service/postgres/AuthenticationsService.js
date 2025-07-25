const { Pool } = require('pg');
const InvariantError = require('../../exeptions/InvariantError');
const bycript = require('bcrypt');
const AuthenticationError = require('../../exeptions/AuthenticationError');

class AuthenticationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token]
    };

    await this._pool.query(query);
  }

  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token]
    };

    await this._pool.query(query);
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthenticationError('Kredensial yang anda berikan salah');
    }

    const { id, password:hashedPassword } = result.rows[0];
    const match = await bycript.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('kredensial yang anda berikan salah');
    }

    return id;
  }
}

module.exports = AuthenticationsService;