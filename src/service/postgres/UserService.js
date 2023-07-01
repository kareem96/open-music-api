const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const bcrypt  = require('bcrypt');
const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/NotFoundError');
const AuthenticationError = require('../../exception/AuthenticationsError');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({username, password, fullname}) {
    await this._verifyNewUsername(username);

    const id = `user-${nanoid(16)}`;
    const hashedPass = await bcrypt.hash(password, 10);

    const res = await this._pool.query({
      text: 'insert into users (id, username, password, fullname) VALUES ($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPass, fullname],
    });

    if (!res.rowCount) {
      throw new InvariantError('Gagal mebambahkan pengguna');
    }

    return res.rows[0].id;
  }

  async _verifyNewUsername(username) {
    const res = await this._pool.query({
      text: 'select username from users where username = $1',
      values: [username],
    });

    if (res.rowCount > 0) {
      throw new InvariantError('Gagal menambahkan pengguna baru');
    }
  }

  async verifyUserIfExists(userId) {
    const res = await this._pool.query({
      text: 'select id from users where id = $1',
      values: [userId],
    });

    if (!res.rowCount) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }
  }

  async verifyUserCredential({username, password}) {
    const res = await this._pool.query({
      text: 'select id, password from users where username = $1',
      values: [username],
    });
    if (!res.rowCount) {
      throw new AuthenticationError('Invalid credentials');
    }

    const {id, password: hashedPass} = res.rows[0];

    if (!await bcrypt.compare(password, hashedPass)) {
      throw new AuthenticationError('Invalid credentials');
    }

    return id;
  }
}

module.exports = UsersService;
