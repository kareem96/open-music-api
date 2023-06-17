const ClientError = require('../../exception/ClientError');

class AlbumHandler{
    constructor(service, validator){
        this._service = service;
        this._validator = validator;
        this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
        this.postAlbumHandler = this.postAlbumHandler.bind(this);
        this.putAlbumHandler = this.putAlbumByIdHandler.bind(this);
        this.deletetAlbumHandler = this.deleteAlbumByIdHandler.bind(this);
    }

    async getAlbumByIdHandler(request, h){
        try{
            const {id} = request.params;
            const albumId = await this._service.getAlbumById({id});
            return{
                status: 'success',
                data:{
                    album,
                },
            };
        }catch(error){
            if(error instanceof ClientError){
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async postAlbumHandler(request, h){
        try{
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
        }catch(error){
            if(error instanceof ClientError){
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async putAlbumByIdHandler(request, h){
        try{
            this._validator.validateAlbumPaylod(request.payload);
            const{id} = request.params;
            await this._service.editAlbumId(id, request.payload);

            return {
                status:'success',
                message: 'Album berhasil diperbaharui'
            };
            
        }catch(error){
            if(error instanceof ClientError){
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async deleteAlbumByIdHandler(request, h){
        try{
            this._validator.validateAlbumPaylod(request.payload);
            const{id} = request.params;
            await this._service.editAlbumId(id, request.payload);

            return {
                status:'success',
                message: 'Album berhasil dihapus'
            };
        }catch(error){
            if(error instanceof ClientError){
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

}

module.exports = AlbumHandler;