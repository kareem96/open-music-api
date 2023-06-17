require('dotenv').config();
const Hapi = require('@hapi/hapi');

const songs = require('./api/songs');
const SongService = require('./service/postgres/SongService');
const SongsValidator = require('./validator/songs');

const albums = require('./api/albums');
const AlbumService = require('./service/postgres/AlbumService');
const AlbumValidator = require('./validator/albums');
const ClientError = require('./exception/ClientError');

const init = async () =>{
    const albumService = new AlbumService();
    const songService = new SongService();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes : {
            cors:{
                origin:['*'],
            }
        }
    });
    await server.register([
        {
          plugin: songs,
          options: {
            service: songService,
            validator: SongsValidator,
          },
        },
        {
          plugin: albums,
          options: {
            service: albumService,
            validator: AlbumValidator,
          },
        },
      ]);

    server.ext('onPreResponse', (request, h) => {
      //merndapatkan konteks response dari request
      const {response} = request;
      if(response instanceof Error){
        //penanganan client error secara internal
        if(response instanceof ClientError){
          const newresponse = h.response({
            status: 'fail',
            message: response.message,
          });
          newresponse.code(response.statusCode);
          return newresponse;
        }
        //memperthankan penanganan client error oleh hapi secara native, serperti 404. etc
        if(!response.isServer){
          return h.continue;
        }
        //penanganan server error sesuai kebutuhan
        const newresponse = h.response({
          status: 'error',
          message: 'Terjadi kegagalan pada server kami.'
        });

        
        newresponse.code(500)
        return newresponse
      }
      //jika bukan error, lanjutkan dengan response sebelumnya (tanpa terinvasi)
      return h.continue;
    });
    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};
init();