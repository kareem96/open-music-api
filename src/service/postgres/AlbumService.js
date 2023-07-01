const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/NotFoundError');
const {mapDBAlbumSongModel} = require('../../utils/albums');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({name, year}) {
    const id = `album-${nanoid(16)}`;
    const res = await this._pool.query({
      text: 'insert into albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    });

    if (!res.rows[0].id) {
      throw new InvariantError('Gagal menambhakn album baru');
    }
    return res.rows[0].id;
  }

  async getAlbumById(id) {
    const album = await this._pool.query({
      text: 'select * from albums where id = $1',
      values: [id],
    });

    if (!album.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const songs = await this._pool.query({
      text: 'select id, title, performer from songs where album_id = $1',
      values: [album.rows[0].id],
    });

    return mapDBAlbumSongModel({album: album.rows[0], songs: songs.rows});
  }

  async editAlbumById(id, {name, year}) {
    const res = await this._pool.query({
      text: 'update albums set name = $1, year = $2 where id = $3 RETURNING id',
      values: [name, year, id],
    });

    if (!res.rows.length) {
      throw new NotFoundError('Gagal perbharui album, tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const res = await this._pool.query({
      text: 'delete from albums where id = $1 RETURNING id',
      values: [id],
    });

    if (!res.rows.length) {
      throw new NotFoundError('Gagal hapus album, tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
