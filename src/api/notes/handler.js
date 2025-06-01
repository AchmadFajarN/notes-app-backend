// const ClientError = require('../../exeptions/ClientError');

class NotesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postNoteHandler = this.postNoteHandler.bind(this);
    this.getNotesHandler = this.getNotesHandler.bind(this);
    this.getNoteByIdHandler = this.getNoteByIdHandler.bind(this);
    this.putNoteByIdHandler = this.putNoteByIdHandler.bind(this);
    this.deleteNoteByIdHandler = this.deleteNoteByIdHandler.bind(this);
  }

  async postNoteHandler(req, h) {
    this._validator.validateNotePayload(req.payload);
    const { title = 'untitled', body, tags } = req.payload;

    const noteId = await this._service.addNote({ title, body, tags });

    const response = h.response({
      status: 'success',
      message: 'Catatan berhasil ditambahkan',
      data: {
        noteId
      }
    });

    response.code(201);
    return response;
  }

  async getNotesHandler() {
    const notes = await this._service.getAllNote();

    return {
      status: 'success',
      data: {
        notes,
      }
    };
  }

  async getNoteByIdHandler(req) {
    const { id } = req.params;
    const note = await this._service.getNoteById(id);

    return {
      status: 'success',
      data: {
        note,
      }
    };
  }

  async putNoteByIdHandler(req) {
    this._validator.validateNotePayload(req.payload);
    const { id } = req.params;
    await this._service.editNoteById(id, req.payload);

    return {
      status: 'success',
      message: 'Catatan berhasil diperbarui'
    };

  }

  async deleteNoteByIdHandler(req) {
    const { id } = req.params;
    await this._service.deleteNoteById(id);

    return {
      status: 'success',
      message: 'Catatan berhasil dihapus'
    };
  }
}

module.exports = NotesHandler;