require('dotenv').config();
const Hapi = require('@hapi/hapi');

const songs = require('./api/songs');
const SongsService = require('./service/postgres/SongService');
const SongsValidator = require('./validator/songs');

const albums = require('./api/albums');
const AlbumService = require('./service/postgres/AlbumService');
const AlbumValidator = require('./validator/albums');
const SongService = require('./service/postgres/SongService');

const init = async () =>{
    const albumService = new AlbumService();
    const songService = new SongService();

    const server = Hapi.server({
        port: prosess.env.PORT,
        host: prosess.env.HOST,
        router : {
            cors:{
                origin:['*'],
            }
        }
    });
    await server.register([
        {
            plugins: songs,
            options:{
                service: songService,
                validator: SongsValidator,
            }
        },
        {
            plugins: albums,
            options:{
                service: albumService,
                validator: AlbumValidator,
            }
        },
    ]);
    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};
init();