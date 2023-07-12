require('dotenv').config();
const Inert = require('@hapi/inert');
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');

const ClientError = require('./exception/ClientError');

const AlbumsService = require('./service/postgres/AlbumService');
const albums = require('./api/albums');
const AlbumsValidator = require('./validator/albums');

const SongsService = require('./service/postgres/SongService');
const songs = require('./api/songs');
const SongsValidator = require('./validator/songs');

const UsersService = require('./service/postgres/UserService');
const users = require('./api/users');
const UsersValidator = require('./validator/user');

const authentications = require('./api/authentications');
const AuthenticationsService = require('./service/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentication');

const PlaylistsService = require('./service/postgres/PlaylistService');
const playlists = require('./api/playlist');
const PlaylistsValidator = require('./validator/playlist');

const CollaborationsService = require('./service/postgres/CollaborationsService');
const collaborations = require('./api/collaborations');
const CollaborationsValidator = require('./validator/collaboration');

const _exports = require('./api/exports');
const ProducerService = require('./service/rabbitmq/ProducesService');
const ExportsValidator = require('./validator/exports');

const CacheService = require('./service/redis/CacheService');

const StorageService = require('./service/storage/StorageService');
const UploadValidator = require('./validator/uploads');

const PlayListActivitiesService = require('./service/postgres/PlaylistActivitiesService');


const init = async () =>{
  const cacheService = new CacheService();
  const albumService = new AlbumsService(cacheService);
  const songsService = new SongsService();
  const usersService = new UsersService();
  const collaborationService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationService);
  const activitiesService = new PlayListActivitiesService();
  const storageService = new StorageService(path.resolve(__dirname, 'api/albums/file/images'));

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
      },
      {
        plugin: Inert,
      },
    ]);

    server.auth.strategy('openmusic_jwt', 'jwt', {
      keys: process.env.ACCESS_TOKEN_KEY,
      verify: {
        aud: false,
        iss: false,
        sub: false,
        maxAgeSec: process.env.ACCESS_TOKEN_AGE,
      },
      validate: (artifacts) => ({
        isValid: true,
        credentials: {
          id: artifacts.decoded.payload.id,
        },
      }),
    });

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
        console.log(response);
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

    await server.register([
      {
        plugin: albums,
        options: {
          service: albumService,
          validator: AlbumsValidator,
          storageService,
          uploadsValidator: UploadValidator,
        },
      },
      {
        plugin: songs,
        options: {
          service: songsService,
          validator: SongsValidator,
        },
      },
      {
        plugin: users,
        options: {
          service: usersService,
          validator: UsersValidator,
        },
      },
      {
        plugin: authentications,
        options: {
          authenticationsService: new AuthenticationsService(),
          usersService: new UsersService(),
          tokenManager: TokenManager,
          validator: AuthenticationsValidator,
        },
      },
      {
        plugin: playlists,
        options: {
          playlistsService: playlistsService,
          activitiesService: activitiesService,
          songsService: songsService,
          validator: PlaylistsValidator,
        },
      },
      {
        plugin: collaborations,
        options: {
          collaborationsService: new CollaborationsService(),
          playlistsService,
          usersService,
          validator: CollaborationsValidator,
        },
      },
      {
        plugin: _exports,
        options: {
          service: ProducerService,
          playlistsService,
          validator: ExportsValidator
        }
      }
    ]);
  

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);

};
init();