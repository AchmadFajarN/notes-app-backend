const CollaborationHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'Collaborations',
  version: '1.0.0',
  register: async (server, { collaborationService, notesService, validator }) => {
    const collaborationsHandler = new CollaborationHandler(
      collaborationService, notesService, validator
    );

    server.route(routes(collaborationsHandler));
  }
};