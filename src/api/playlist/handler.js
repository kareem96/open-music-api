module.exports = class PlaylistsHandler {
  constructor(playlistsService, activitiesService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._activitiesService = activitiesService;
    this._songsService = songsService;
    this._validator = validator;
  }

  async postPlaylistHandler(req, h) {
    this._validator.validatePostPlaylistPayload(req.payload);
    const {id: credentialId} = req.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist(req.payload.name, credentialId);

    return this._renderResponse(h, {
      data: {playlistId},
      statusCode: 201,
    });
  }

  async getPlaylistsHandler(req, h) {
    const playlists = await this._playlistsService.getPlaylists(req.auth.credentials.id);

    return this._renderResponse(h, {
      data: {playlists},
    });
  }

  async deletePlaylistByIdHandler(req, h) {
    const {id: playlistId} = req.params;
    const {id: credentialId} = req.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._playlistsService.deletePlaylistById(playlistId);

    return this._renderResponse(h, {
      msg: 'Berhasil hapus playlist',
    });
  }

  async postSongOnPlaylistsHandler(req, h) {
    this._validator.validatePostSongOnPlaylistPayload(req.payload);
    const {id: playlistId} = req.params;
    const {id: credentialId} = req.auth.credentials;
    const {songId} = req.payload;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._songsService.verifySongIsExists(songId);
    await this._playlistsService.addSongToPlaylists(playlistId, songId);

    // store activities
    await this._activitiesService.addActivities({
      playlistId, songId, userId: credentialId, action: 'add',
    });

    return this._renderResponse(h, {
      msg: 'Berhasil menambhakna lagu ke playlist',
      statusCode: 201,
    });
  }

  async getSongsOnPlaylistsHandler(req, h) {
    const {id: playlistId} = req.params;
    const {id: credentialId} = req.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._playlistsService.getSongsOnPlaylist(playlistId, credentialId);

    return this._renderResponse(h, {
      data: {playlist},
    });
  }

  async deleteSongOnPlaylistHandler(req, h) {
    this._validator.validateDeleteSongOnPlaylistPayload(req.payload);
    const {id: playlistId} = req.params;
    const {id: credentialId} = req.auth.credentials;
    const {songId} = req.payload;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._songsService.verifySongIsExists(songId);
    await this._playlistsService.deleteSongOnPlaylist(songId);
    await this._activitiesService.addActivities({
      playlistId, songId, userId: credentialId, action: 'delete',
    });

    return this._renderResponse(h, {
      msg: 'berhasil hapus lagu dari playlist',
    });
  }

  async getActivitiesOnPlaylistHandler(req, h) {
    const {id: playlistId} = req.params;
    const {id: credentialId} = req.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const activities = await this._activitiesService.getActivities(playlistId);

    return this._renderResponse(h, {
      data: {
        playlistId, activities,
      },
    });
  }

  _renderResponse(h, {msg, data, statusCode = 200}) {
    const resObj = {
      status: 'success',
      message: msg,
      data: data,
    };

    if (msg === null) {
      delete resObj['message'];
    }

    if (data === null) {
      delete resObj['data'];
    }

    const res = h.response(resObj);
    res.code(statusCode);

    return res;
  }
};
