const Hapi = require('@hapi/hapi');
const route = require('./route');

const init = async () => {
  const server = Hapi.server({
    port: 4000,
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
    routes: {
      cors: {
        origin: ['*']
      }
    }
  });

  server.route(route);
  await server.start();

  console.log('Server berjalan di ', server.info.uri);
};

init();