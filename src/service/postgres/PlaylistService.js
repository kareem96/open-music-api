const {Pool} = require('pg');
const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/NotFoundError');
const AuthorizationError = require('../../exception/AuthorizationError');
const {nanoid} = require('nanoid');

module.exports = class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;

    const res = await this._pool.query({
      text: 'insert into playlists VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    });

    if (!res.rowCount) {
      throw new InvariantError('Gagal menamhkan ke playlist');
    }

    return res.rows[0].id;
  }

  async getPlaylists(owner) {
    const res = await this._pool.query({
      text: `select p.id, p.name, u.username rom playlists p
             left join collaborations c on c.playlist_id = p.id
             left join users u ON u.id = p.owner
             where p.owner = $1 OR c.user_id = $1`,
      values: [owner],
    });

    return res.rows;
  }

  async deletePlaylistById(id) {
    const res = await this._pool.query({
      text: 'delete from playlists where id = $1 RETURNING id',
      values: [id],
    });

    if (!res.rowCount) {
      throw new NotFoundError('Gagal hapus playlist, playlist tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const res = await this._pool.query({
      text: 'select owner from playlists where id = $1',
      values: [id],
    });

    if (!res.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    if (res.rows[0].owner !== owner) {
      throw new AuthorizationError('Tidak dapat mengakses data ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw e;
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw e;
      }
    }
  }

  async addSongToPlaylists(playlistId, songId) {
    const id = `playlist_song-${nanoid(16)}`;

    const res = await this._pool.query({
      text: 'insert into playlist_songs VALUES ($1, $2,$3) RETURNING id',
      values: [id, playlistId, songId],
    });

    if (!res.rowCount) {
      throw new InvariantError('Gagal menambhakan lagu ke playlist');
    }
  }

  async getSongsOnPlaylist(playlistId, owner) {
    const playlist = await this._pool.query({
      text: `select playlists.id, playlists.name, users.username from playlists 
             full outer join users ON users.id = playlists.owner 
             where playlists.id = $1`,
      values: [playlistId],
    });

    const songs = await this._pool.query({
      text: `select songs.id, songs.title, songs.performer from songs
            left join playlist_songs ps 
                ON songs.id = ps.song_id
            left join playlists
                ON playlists.id = ps.playlist_id
            where playlist_id = $1 OR playlists.owner = $2`,
      values: [playlistId, owner],
    });

    playlist.rows[0].songs = songs.rows;

    return playlist.rows[0];
  }

  async deleteSongOnPlaylist(songId) {
    const res = await this._pool.query({
      text: 'delete from playlist_songs where song_id = $1 RETURNING id',
      values: [songId],
    });

    if (!res.rowCount) {
      throw new NotFoundError('Gagal hapus lagu, tidak ditemukan');
    }
  }
};
