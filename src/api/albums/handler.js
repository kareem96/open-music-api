const autoBind = require('auto-bind');

class AlbumHandler{
    constructor(service, validator){
        this._service = service;
        this._validator = validator;

        autoBind(this); //mem-bind nilai this untuk seluruh method sekaligus
    }

    async getAlbumByIdHandler(request, h){
        const {id} = request.params;
            const album = await this._service.getAlbumById({id});
            return{
                status: 'success',
                data:{
                    album,
                },
            };
    }

    async postAlbumHandler(request, h){
        this._validator.validateAlbumPaylod(request.payload);
            const{name, year} = request.payload;
            const albumId = await this._service.addAlbum({name, year});

            const response = h.response({
                status: 'success',
                message: 'Album berhasil ditambahkan',
                data :{
                    albumId,
                }
            });
            response.code(201);
            return response;
    }

    async putAlbumByIdHandler(request, h){
        this._validator.validateAlbumPaylod(request.payload);
            const{id} = request.params;
            await this._service.editAlbumId(id, request.payload);

            return {
                status:'success',
                message: 'Album berhasil diperbaharui'
            };
    }

    async deleteAlbumByIdHandler(request, h){
        this._validator.validateAlbumPaylod(request.payload);
        const{id} = request.params;
        await this._service.editAlbumId(id, request.payload);
        return {
            status:'success',
            message: 'Album berhasil dihapus'
        };
    }

}

module.exports = AlbumHandler;