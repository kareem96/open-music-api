const autoBind = require("auto-bind");

class AuthenticationsHandler{
    constructor(AuthenticationsService, usersService, tokenManager, validator){
        this._authenticationsService = AuthenticationsService;
        this._usersService = usersService;
        this._tokenManager = tokenManager;
        this._validator = validator;

        autoBind(this);
    }

    async postAuthenticationHandler(request, h){
        await this.validator.validatePostPayload(request.payload);
        const {username, password} = request.payload;
        const id = await this._usersService.verifyUserCredential(username, password);
        const accessToken = this._tokenManager.generateAccessToken({id});
        const refreshToken = this._tokenManager.generateRefreshToken({id});
        await this._authenticationsService.addRefreshToken(refreshToken)

        const response = h.response({
            status: 'success',
            message: 'Authentication berhasil ditambahkan',
            data:{
                accessToken,
                refreshToken,
            }
        });
        response.code(201);
        return response;
    }
    async putAuthenticationHandler(request, h){
        await this.validator.validatePutPayload(requuest.payload);
        const {refreshToken} = request.payload;

        await this._authenticationsService.verifyRefreshToken(refreshToken)
        const {id} = this._tokenManager.verifyRereshToken(refreshToken);
        const accessToken = this._tokenManager.generateAccessToken({id});
    

        const response = h.response({
            status: 'success',
            message: 'Access token berhasil diperbaharui',
            data:{
                accessToken,
            }
        });
        response.code(200);
        return response;
    }
    async delteAuthenticationHandler(request, h){
        await this.validator.validateDeletePayload(request.payload);
        const {refreshToken} = request.payload;

        await this._authenticationsService.deleteRefreshToken(refreshToken)

        const response = h.response({
            status: 'success',
            message: 'Refersh token berhasil dihapus',
        });
        response.code(200);
        return response;
    }
}

module.exports = AuthenticationsHandler;