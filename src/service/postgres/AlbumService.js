const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/NotFoundError');
const {mapDBAlbumSongModel} = require('../../utils/albums');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
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

  async editCoverAlbumById(id, coverUrl) {
    const query = {
      text: "UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id",
      values: [coverUrl, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Gagal memperbarui cover album. Id tidak ditemukan");
    }
  }

  async verifyLikeAlbumById(albumId, userId) {
    const query = {
      text: "SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2",
      values: [albumId, userId],
    };
    const result = await this._pool.query(query);
    if (result.rows.length > 0) {
      throw new InvariantError("Gagal menambahkan like album. Like sudah pernah dilakukan");
    }
  }

  async addLikeAlbumById(albumId, userId) {
    const id = `like-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id",
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Gagal menambahkan like album. Id tidak ditemukan");
    }
    await this._cacheService.delete(`likes:${albumId}`);
  }

  async deleteLikeAlbumById(albumId, userId) {
    const query = {
      text: "DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id",
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Gagal menghapus like album. Id tidak ditemukan");
    }
    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getLikeAlbumById(albumId) {
    try {
      const likes = await this._cacheService.get(`likes:${albumId}`);
      return {
        likes: Number(likes),
        cache: true,
      };
    } catch (error) {
      const query = {
        text: "SELECT * FROM user_album_likes WHERE album_id = $1",
        values: [albumId],
      };
      const likes = await this._pool.query(query);

      await this._cacheService.set(`likes:${albumId}`, likes.rowCount);
      return {
        likes: likes.rowCount,
        cache: false,
      };
    }
  }

}

module.exports = AlbumsService;
