require('dotenv').config();
const Hapi = require('@hapi/hapi');

const songs = require('./api/songs');
const SongService = require('./service/postgres/SongService');
const SongsValidator = require('./validator/songs');

const albums = require('./api/albums');
const AlbumService = require('./service/postgres/AlbumService');
const AlbumValidator = require('./validator/albums');

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
    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};
init();