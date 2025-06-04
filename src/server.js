// dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');

// notes
const notes = require('./api/notes');
const NoteService = require('./service/postgres/NoteService');
const NotesValidator = require('./validator/notes');
const ClientError = require('./exeptions/ClientError');

// users
const users = require('./api/users');
const UserService = require('./service/postgres/UserService');
const UserValidator = require('./validator/users');

const init = async () => {
  const noteService = new NoteService();
  const userService = new UserService();

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