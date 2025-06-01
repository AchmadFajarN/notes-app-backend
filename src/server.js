require('dotenv').config();
const Hapi = require('@hapi/hapi');
const notes = require('./api/notes');
const NoteService = require('./service/postgres/NoteService');
const NotesValidator = require('./validator/notes');
const ClientError = require('./exeptions/ClientError');

const init = async () => {
  const noteService = new NoteService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  });

  await server.register({
    plugin: notes,
    options: {
      service: noteService,
      validator: NotesValidator
    }
  });
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