// dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

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

const init = async () => {
  const collaborationService = new CollaboratorService();
  const noteService = new NoteService(collaborationService);
  const userService = new UserService();
  const authenticationsService = new AuthenticationsService();

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
      plugin: Jwt
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