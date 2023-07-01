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
        await this._validator.validateCollaborationPayload(request.payload);

        const {id: credentialId} = request.auth.credentials;
        const {playlistId, userId} = request.payload;
        
        await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
        await this._userService.getUserById(userId);
        const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);

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
        await this._validator.validateCollaborationPayload(request.payload);

        const {id: credentialId} = request.auth.credentials;
        const {playlistId, userId} = request.payload;
        
        await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
        await this._collaborationsService.deleteCollaborations(playlistId, userId);
        
        const response = h.response({
            status: 'success',
            message: 'Kollaborasi berhasil di hapus',
        });
        response.code(201);
        return response;
    }
}

module.exports = CollaborationsHandler;