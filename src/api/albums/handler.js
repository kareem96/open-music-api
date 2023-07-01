const autoBind = require('auto-bind');

class AlbumHandler{
    constructor(service, validator){
        this._service = service;
        this._validator = validator;
        this._renderResponse = this._renderResponse.bind(this);

        autoBind(this); //mem-bind nilai this untuk seluruh method sekaligus
    }

    async getAlbumByIdHandler(request, h){
        const {id} = request.params;
        const album = await this._service.getAlbumById(id);
        return this._renderResponse(h, {
            data: {album},
        });
    }

    async postAlbumHandler(request, h){
        this._validator.validateAlbumPayload(request.payload);
        const{name, year} = request.payload;
        const albumId = await this._service.addAlbum({name, year});

        return this._renderResponse(h, {
            data: {albumId},
            statusCode: 201,
        });
    }

    async putAlbumByIdHandler(request, h){
        const{id} = request.params;
        this._validator.validateAlbumPayload(request.payload);
        const {name, year} = request.payload;
        await this._service.editAlbumById(id, {name, year});
        return this._renderResponse(h, {
            message: 'success perbaharui album'
        });
    }

    async deleteAlbumByIdHandler(request, h){
        const{id} = request.params;
        await this._service.deleteAlbumById(id, request.payload);
        return this._renderResponse(h, {
            message: 'sukses hapus album'
        });
    }

    _renderResponse(h, {message, data, statusCode = 200}){
        const resObject = {
            status: 'success',
            message: message,
            data: data,
        };
        if(message === null){
            delete resObject ['message'];
        }
        if(data === null){
            delete resObject['data'];
        }
        const response  = h.response(resObject);
        response.code(statusCode);
        return response;
    }

}

module.exports = AlbumHandler;