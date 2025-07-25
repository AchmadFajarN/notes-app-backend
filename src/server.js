// dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Innert = require('@hapi/inert');
const Jwt = require('@hapi/jwt');
const path = require('path');

// notes
const notes = require('./api/notes');
const NoteService = require('./service/postgres/NoteService');
const NotesValidator = require('./validator/notes');
const ClientError = require('./exeptions/ClientError');

// users
const users = require('./api/users');
const UserService = require('./service/postgres/UserService');
const UserValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationValidator = require('./validator/authentications');
const AuthenticationsService = require('./service/postgres/AuthenticationsService');

// collaborations
const collaborations = require('./api//collaborations');
const CollaboratorService = require('./service/postgres/CollaboratorService');
const CollaborationsValidator = require('./validator/collaborations');

// export
const _exports = require('./api/exports');
const ProducerService = require('./service/rabbitMq/ProducerService');
const ExportValidator = require('./validator/exports');

// uploads
const uploads = require('./api/uploads');
const StorageService = require('./service/postgres/StorageService');
const uploadsValidator = require('./validator/uploads');

// cache
const CacheService = require('./service/postgres/CacheService');

const init = async () => {
  const cacheService = new CacheService();
  const collaborationService = new CollaboratorService(cacheService);
  const noteService = new NoteService(collaborationService, cacheService);
  const userService = new UserService();
  const authenticationsService = new AuthenticationsService();
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Innert,
    }
  ]);

  server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id
      }
    })
  });

  await server.register([
    {
      plugin: notes,
      options: {
        service: noteService,
        validator: NotesValidator
      }
    },
    {
      plugin: users,
      options: {
        service: userService,
        validator: UserValidator
      }
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService: userService,
        tokenManager: TokenManager,
        validator: AuthenticationValidator
      }
    },
    {
      plugin: collaborations,
      options: {
        collaborationService,
        notesService: noteService,
        validator: CollaborationsValidator
      }
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportValidator
      }
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: uploadsValidator
      }
    }
  ]);
  server.ext('onPreResponse', (req, h) => {
    const { response } = req;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });
  await server.start();

  console.log('Server berjalan di ', server.info.uri);
};

init();