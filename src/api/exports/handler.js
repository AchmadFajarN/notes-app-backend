class ExportHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postExportNotesHandler = this.postExportNotesHandler.bind(this);
  }

  async postExportNotesHandler(req, h) {
    this._validator.validateExportNotesPayload(req.payload);
    const message = {
      userId: req.auth.credentials.id,
      targetEmail: req.payload.targetEmail
    };

    await this._service.sendMessage('export:notes', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan anda dalam antrean'
    });

    response.code(200);
    return response;
  }
}

module.exports = ExportHandler;