const ClientError = require('../../exeptions/ClientError');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
    this.getUserByUsernameHandler = this.getUserByUsernameHandler.bind(this);
  };

  async postUserHandler(req, h) {
    this._validator.validateUserPayload(req.payload);
    const { username, password, fullname } = req.payload;

    const userId = await this._service.addUser({ username, password, fullname });
    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId
      }
    });
    response.code(201);
    return response;
  }

  async getUserByIdHandler(req) {
    const { id } = req.params;
    const user = await this._service.getUserById(id);

    return {
      status: 'success',
      data: {
        user
      }
    };
  }

  async getUserByUsernameHandler(req, h) {
    try {
      const { username = '' } = req.query;
      const users = await this._service.getUserByUsername(username);

      return {
        status: 'success',
        data: {
          users
        }
      };
    } catch (err) {
      if (err instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: err.message
        });

        response.code(err.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami'
      });
      response.code(500);
      console.log(err);
      return response;
    }
  }
}

module.exports = UsersHandler;