require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');


const songs = require('./api/songs');
const SongService = require('./service/postgres/SongService');
const SongsValidator = require('./validator/songs');

const albums = require('./api/albums');
const AlbumService = require('./service/postgres/AlbumService');
const AlbumValidator = require('./validator/albums');
const ClientError = require('./exception/ClientError');

const authentications = require('./api/authentications');
const AuthenticationsService = require('./service/postgres/AuthenticationsService');
const AuthenticationValidator = require('./validator/authentication/index');
const TokenManager = require('./tokenize/TokenManager');

const collaborations = require('./api/collaborations');
const CollaborationsService = require('./service/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaboration');

const playlist = require('./validator/playlist');
const PlaylistService = require('./service/postgres/PlaylistService');
const PlaylistValidator = require('./validator/collaboration');

const users = require('./validator/user');
const UsersService = require('./service/postgres/UserService');
const UsersValidator = require('./validator/user');


const init = async () =>{
    const albumService = new AlbumService();
    const authenticationsService = new AuthenticationsService();
    const collaborationsService = new CollaborationsService();
    const playlistService = new PlaylistService();
    const songService = new SongService();
    const usersService = new UsersService();

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
        plugin: Jwt,
      }
    ]);

    server.auth.strategy('openmusic_jwt', 'jwt', {
      keys: process.env.ACCESS_TOKEN_KEY,
      verify:{
        aud: false,
        iss: false,
        sub: false,
        maxAgeSec: proecess.env.ACCESS_TOKEN_AGE
      },
      valdate:(artifacts) => ({
        isValid: true,
        credentials:{
          id: artifacts.decode.payload.id,
        }
      })
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
        {
          plugin: authentications,
          options: {
            authenticationsService,
            usersService,
            tokenManager:TokenManager,
            validator: AuthenticationValidator,
          },
        },
        {
          plugin: collaborations,
          options: {
            collaborationsService,
            playlistService,
            usersService,
            validator: CollaborationsValidator,
          },
        },
        {
          plugin: playlist,
          options: {
            playlistService,
            songService,
            validator: PlaylistValidator,
          },
        },
        {
          plugin: users,
          options: {
            service: usersService,
            validator: UsersValidator,
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