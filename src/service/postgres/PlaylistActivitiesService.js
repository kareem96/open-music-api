const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exception/InvariantError');

module.exports = class PlaylistActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivities({playlistId, songId, userId, action}) {
    const id = `activities-${nanoid(16)}`;
    const res = await this._pool.query({
      text: 'insert into playlist_song_activities VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlistId, songId, userId, action],
    });

    if (!res.rowCount) {
      throw new InvariantError('tidak menambahkan aktifiatas');
    }
  }

  async getActivities(playListId) {
    const res = await this._pool.query({
      text: `select u.username, s.title, psa.action, psa.time from playlist_song_activities psa 
            left join playlists p ON p.id = psa.playlist_id 
            left join users u ON u.id = p.owner
            left join songs s ON psa.song_id = s.id
            where playlist_id = $1`,
      values: [playListId],
    });
    return res.rows;
  }
};
