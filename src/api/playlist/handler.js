const autoBind = require("auto-bind");

class PlaylistHandler {
    constructor(playlistService, songsService, validator){
        this._playlistService = playlistService,
        this._songsService = songsService,
        this._acitivitiesService = activitiesService,
        this._validator = validator;
        autoBind(this);
    }

    async getPlaylistHandler(request, h){
        const playlist = await this._playlistService.getPlaylist(request.auth.credentials.id);
        const response = h.response({
            status: 'success',
            data:{
                playlist,
            }
        });
        response.code(200);
        return response;
    }

    async deletePlaylistHandler(request, h){
        const{id: playlistId} = request.params;
        const{id: credentialId} = request.params;

        await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
        await this._playlistService.deletePlaylist(playlistId);

        const response = h.repsonse({
            status: 'success',
            message: 'Playlist berhasil di hapus',
        });
        response.code(200);
        return response;
    }

    async getPlaylistSongHandler(request, h){
        const {id: playlistId} = request.params;
        const {id: credentialId} = request.auth.credentials;

        await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
        const playlist = await this._playlistService.getPlaylistSong(playlistId, credentialId);
        
        const response = h.response({
            status: 'success',
            data:{
                playlist,
            }
        });
        response.code(200);
        return response;
    }

    async postPlaylistSongsHandler(request, h){
        await this._validator.validatorPlaylistSongPayload(request.payload);
        const {id: playlistId} = request.params;
        const {id: credentialId} = request.auth.credentials;
        const {songId} = request.payload;

        await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
        await this._songsService.verifySongIsExists(songId);
        await this._acitivitiesService.addActivities({playlistId, songId, userId: credentialId, action: 'add'});

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditambahkan ke playlist',
        });
        response.code(201);
        return response;
    }

    async deletePlaylistSongsHandler(request, h){
        await this._validator.validateDeletePlaylistSongPayload(request.payload);
        const {id: playlistId} = request.params;
        const {id: credentialId} = request.auth.credentials;
        const {songId} = request.payload;

        await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
        await this._songsService.verifySongIsExists(songId);
        await this._playlistService.deletePlaylistSong(id, songId, user, "delete");

        await this._acitivitiesService.addActivities({
            playlistId, songId, userId: credentialId, action: 'delete'
        });
        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil dihapus dari playlist',
        });
        response.code(200);
        return response;
    }

    async getPlaylistSongActivities(request, h){
        const {id: playlistId} = request.params;
        const {id: credentialId} = request.auth.credentials;
        
        await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
        const acitivites = await this._acitivitiesService.getActivities(playlistId);

        const response = h.response({
            status: 'success',
            data:{
                playlistId,
                acitivites,
            }
        });
        response.code(200);
        return response;
    }
}
module.exports = PlaylistHandler;