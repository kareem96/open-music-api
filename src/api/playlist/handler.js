const autoBind = require("auto-bind");

class PlaylistHandler {
    constructor(playlistService, songsService, validator){
        this._playlistService = playlistService,
        this._songsService = songsService,
        this._validator = validator;
        autoBind(this);
    }

    async getPlaylistHandler(request, h){
        const {id: owner} = request.auth.credentials;
        const playlist = await this._playlistService.getPlaylist(owner);
        const response = h.response({
            status: 'success',
            data:{
                playlist,
            }
        });
        response.code(200);
        return response;
    }

    async getPlaylistByIdHandler(request, h){
        const {id: user}  = request.auth.credentials;
        const {id} = request.params;
        await this._playlistService.verifyPlaylistAccess(id, user);
        const playlist = await this._playlistService.getPlaylistById(id);
        const response = h.response({
            status: 'success',
            data:{
                playlist,
            }
        });
        response.code(200);
        return response;
    }

    async postPlaylistHandler(request, h){
        const {id: credentialId}  = request.auth.credentials;
        const {name} = request.payload;
        await this._validator.validatePlaylistPayload(request.payload);
        const playlistId = await this._playlistService.addPlaylist(name, credentialId);
        const response = h.response({
            status: 'success',
            data:{
                playlistId,
            }
        });
        response.code(201);
        return response;
    }

    async deletePlaylistHandler(request, h){
        const{id} =request.params;
        const{id:user} =request.auth.credentials;
        await this._playlistService.verifyPlaylistOwner(id, user);
        await tihis._playlistService.deletePlaylist(id);
        const response = h.repsonse({
            status: 'success',
            message: 'Playlist berhasil di hapus',
        });
        response.code(200);
        return response;
    }

    async getPlaylistSongHandler(request, h){
        const {id} = request.params;
        const {id: user} = request.auth.credentials;
        await this._playlistService.verifyPlaylistAccess(id, user);
        const playlist = await this._playlistService.getPlaylistSong(id);
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
        const {id} = request.params;
        const {id: user} = request.auth.credentials;
        const {songId} = request.payload;
        await this._validator.validatorPlaylistSongPayload(request.payload);
        await this._songsService.getSongById(songId);
        await this._playlistService.addPlaylist(id, songId);
        await this._playlistService.verifyPlaylistAccess(id, user);
        await this._playlistService.addPlaylistSongActivities(id, songId, user, "add");
        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditambahkan ke playlist',
            data:{
                playlist,
            }
        });
        response.code(201);
        return response;
    }

    async deletePlaylistSongsHandler(request, h){
        const {id} = request.params;
        const {id: user} = request.auth.credentials;
        const {songId} = request.payload;
        await this._validator.validateDeletePlaylistSongPayload(request.payload);
        await this._playlistService.verifyPlaylistAccess(id, user);
        await this._playlistService.deletePlaylist(songId);
        await this._playlistService.addPlaylistSongActivities(id, songId, user, "delete");
        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil dihapus dari playlist',
        });
        response.code(200);
        return response;
    }

    async getPlaylistSongActivities(request, h){
        const {id: playlistId} = request.params;
        const {id: userId} = request.auth.credentials;
        
        await this._playlistService.verifyPlaylistAccess(playlistId, userId);
        const acitivites = await this._playlistService.getPlaylistSongActivities(playlistId);

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