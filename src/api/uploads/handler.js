class UploadHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postUploadImageHandler(req, h) {
    const { data } = req.payload;
    this._validator.validateImageHeaders(data.hapi.headers);

    const fileName = await this._service.writeFile(data, data.hapi);

    const response = h.response({
      status: 'success',
      data: {
        fileLocation: `http://${process.env.HOST}:${process.env.PORT}/upload/images/${fileName}`,
      }
    });

    response.code(201);
    return response;
  }
}

module.exports = UploadHandler;