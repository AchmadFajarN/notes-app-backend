const AuthenticationHandler = require('./handler');
const route = require('./route');

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server, {
    authenticationsService,
    usersService,
    tokenManager,
    validator
  }) => {
    const authenticationHandler = new AuthenticationHandler(
      authenticationsService,
      usersService,
      tokenManager,
      validator
    );

    server.route(route(authenticationHandler));
  },
};
