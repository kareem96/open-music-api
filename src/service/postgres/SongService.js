const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/NotFoundError');
const {mapDBSongModel} = require('../../utils/songs');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({title, year, genre, performer, duration, albumId}) {
    const id = `song-${nanoid(16)}`;
    const res = await this._pool.query({
      text: 'insert into songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    });

    if (!res.rows[0].id) {
      throw new InvariantError('Gagal menambahkan lagu baru');
    }
    return res.rows[0].id;
  }

  async getSongs({title = '', performer = ''}) {
    const query = {
      text: 'select id, title, performer from songs where title ILIKE $1 and performer ILIKE $2',
      values: [`%${title}%`, `%${performer}%`],
    };

    const res = await this._pool.query(query);
    return res.rows;
  }

  async getDetailSongById(id) {
    const res = await this._pool.query({
      text: 'select * from songs where id = $1',
      values: [id],
    });

    if (!res.rowCount) {
      throw new NotFoundError(`lagu id: ${id} tidak ditemukan`);
    }

    return res.rows.map(mapDBSongModel)[0];
  }

  async editSongById(id, {title, year, genre, performer, duration, albumId}) {
    const res = await this._pool.query({
      text: 'update songs set title = $1, year = $2 , genre = $3, performer = $4, duration = $5, album_id = $6 where id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    });

    if (!res.rowCount) {
      throw new NotFoundError('Gagal merubah lagu, lagu tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const res = await this._pool.query({
      text: 'delete from songs where id = $1 RETURNING id',
      values: [id],
    });

    if (!res.rowCount) {
      throw new NotFoundError('Gagal hapus lagu, lagu tidak ditemukan');
    }
  }

  async verifySongIsExists(id) {
    const res= await this._pool.query({
      text: 'select id from songs where id = $1',
      values: [id],
    });

    if (!res.rowCount) {
      throw new NotFoundError('lagu tidak ditemukan');
    }
  }
}

module.exports = SongsService;
