const ClientError = require('../../exception/ClientError');
class SongsHandler{
    constructor(service, validator){
        this._service = service;
        this._validator = validator;

        this.getSongHandler = this.getSOngHandler.bind(this);
        this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
        this.postSongHandler = this.postSongHandler.bind(this);
        this.putSongByidHandler = this.putSongByidHandler.bind(this);
        this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
    }

    async getSongHandler(){
        const song = await this.service.getSongs();
        return {
            status: 'success',
            data:{
                songs,
            }
        };
    }

    async getSongByIdHandler(request, h){
        try{
            const {id} = request.params;
            const song = await this._service.getSongById(id);
            return{
                status: 'success',
                data:{
                    song,
                }
            };
        }catch(error){
            if(error instanceof ClientError){
                const response = h.response({
                    status: 'fail',
                    message: error.message.message,
                });
                response.code(error.statusCode);
                return response;
            }

            const response = h.response({
                status: 'error',
                message: 'Maaf terjadi kegagalan pada server kami',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }
    
    async postSongHandler(request, h){
        try {
            this._validator.validateSongPayload(request.payload);
            const{
                title, year, genre, performer, duration, albumId,
            }= request.payload;
            const songId = await this._service.addSong({
                title, year, performer, duration, albumId
            });
            const response = h.response({
                statsu: 'success',
                message: 'Lagu berhasil ditambahakn',
                data:{
                    songId,
                }
            });
            response.code(201);
            return response;
        } catch (error) {
            if(error instanceof ClientError){
                const response = h.response({
                    status: 'fail',
                    message: error.message
                });
                response.code(error.statusCode);
                return response;
            }
            const response = h.response({
                status: 'error',
                message: 'Maaf terjadi kegagalan pada server kami'
            });
            response.code(5000);
            console.log(error);
            return response;
        }
    }

    async putSongByIdHandler(request, h){
        try{
            this._validator.validateSongPayload(request.payload);
            const {id} = request.params;
            await this._service.getSongById(id);
            return{
                status: 'success',
                message: 'Lagu berhasil diperbaharui'
            };
        }catch(error){
            if(error instanceof ClientError){
                const response = h.response({
                    status: 'fail',
                    message: error.message.message,
                });
                response.code(error.statusCode);
                return response;
            }

            const response = h.response({
                status: 'error',
                message: 'Maaf terjadi kegagalan pada server kami',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }

    async deleteSongByIdHandler(request, h){
        try{
            const {id} = request.params;
            await this._service.getSongById(id);
            return{
                status: 'success',
                message: 'Lagu berhasil dihapus'
            };
        }catch(error){
            if(error instanceof ClientError){
                const response = h.response({
                    status: 'fail',
                    message: error.message.message,
                });
                response.code(error.statusCode);
                return response;
            }

            const response = h.response({
                status: 'error',
                message: 'Maaf terjadi kegagalan pada server kami',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }
}

module.exports = SongsHandler;