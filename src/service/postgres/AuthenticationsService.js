const {Pool} = require('pg');
const InvariantError = require('../../exception/InvariantError');

module.exports = class AuthenticationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addRefreshToken(token) {
    const res = await this._pool.query({
      text: 'insert into authentications VALUES ($1) RETURNING token',
      values: [token],
    });

    if (!res.rowCount) {
      throw new InvariantError('Gagl menambahkan refresh token baru');
    }
  }

  async verifyRefreshToken(token) {
    const res = await this._pool.query({
      text: 'select token from authentications where token = $1',
      values: [token],
    });

    if (!res.rowCount) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  async deleteRefreshToken(token) {
    await this._pool.query({
      text: 'delete from authentications where token = $1',
      values: [token],
    });
  }
  
};
