const autoBind = require("auto-bind");

class CollaborationsHandler{
    constructor(collaborationsService, usersService, palylistService, validator){
        this._collaborationsService = collaborationsService;
        this._userService = usersService;
        this._playlistService = palylistService;
        this._validator = validator;

        autoBind(this);
    }

    async postCollaborationHandler(request, h){
        const {playlistId, userId} = request.payload;
        const {id: credentialId} = request.auth.credentials;
        
        await this._validator.validateCollaborationPayload(request.payload);
        await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
        await this._userService.getUserById(userId);
        await this._playlistService.getPlaylistById(playlistId);

        const collaborationId = await this._collaborationsService.addCollbaoration(playlistId, userId);
        const response = h.response({
            status: 'success',
            data:{
                collaborationId,
            }
        });
        response.code(201);
        return response;
    }
    async deleteCollaborationHandler(request, h){
        const {playlistId, userId} = request.payload;
        const {id: credentialId} = request.auth.credentials;
        
        await this._validator.validateCollaborationPayload(request.payload);
        await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
        await this._collaborationsService.deleteUserById(playlistId, userId);
        
        const response = h.response({
            status: 'success',
            message: 'Kollaborasi berhasil di hapus',
        });
        response.code(201);
        return response;
    }
}

module.exports = CollaborationsHandler;