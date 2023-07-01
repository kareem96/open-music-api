const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exception/InvariantError');

module.exports = class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'insert into collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal menambhakan kolaborasi');
    }
    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'delete from collaborations where playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);
    console.log(`${playlistId}:${userId}`);
    console.log(result.rows);
    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal dihapus');
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const res = await this._pool.query({
      text: 'select * from collaborations where playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    });
    console.log(`${playlistId}:${userId}`);

    if (!res.rows.length) {
      throw new InvariantError('Gagal verifikasi kolaborasi');
    }
  }
};

