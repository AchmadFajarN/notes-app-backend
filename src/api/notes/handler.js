// const ClientError = require('../../exeptions/ClientError');

const ClientError = require('../../exeptions/ClientError');

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
    try {
      this._validator.validateNotePayload(req.payload);
      const { title = 'untitled', body, tags } = req.payload;
      const { id: credentialId } = req.auth.credentials;

      const noteId = await this._service.addNote({ title, body, tags, owner: credentialId });

      const response = h.response({
        status: 'success',
        message: 'Catatan berhasil ditambahkan',
        data: {
          noteId
        }
      });

      response.code(201);
      return response;
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
        status: 'fail',
        message: 'Maaf terjadi kegagalan pada server kami'
      });
      response.code(500);
      console.log(err);
      return response;
    }
  }

  async getNotesHandler(req) {
    const { id: credentialId } = req.auth.credentials;
    const notes = await this._service.getAllNote(credentialId);

    return {
      status: 'success',
      data: {
        notes,
      }
    };
  }

  async getNoteByIdHandler(req, h) {
    try {
      const { id } = req.params;
      const { id: credentialId } = req.auth.credentials;
      await this._service.verifyNoteOwner(id, credentialId);
      const note = await this._service.getNoteById(id);

      return {
        status: 'success',
        data: {
          note,
        }
      };
    } catch (err) {
      if (err instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: err.message,
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

  async putNoteByIdHandler(req, h) {
    try {
      this._validator.validateNotePayload(req.payload);
      const { id: credentialId } = req.auth.credentials;
      const { id } = req.params;

      await this._service.verifyNoteOwner(id, credentialId);
      await this._service.editNoteById(id, req.payload);

      return {
        status: 'success',
        message: 'Catatan berhasil diperbarui'
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
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server kami'
      });
      response.code(500);
      console.log(err);
      return response;
    }

  }

  async deleteNoteByIdHandler(req, h) {
    try {
      const { id } = req.params;
      const { id: credentialId } = req.auth.credentials;

      await this._service.verifyNoteOwner(id, credentialId);
      await this._service.deleteNoteById(id);

      return {
        status: 'success',
        message: 'Catatan berhasil dihapus'
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
        status: 'fail',
        message: 'Maaf, terjadi kesalahan di server kami'
      });

      response.code(500);
      console.log(err);
      return response;
    }
  }
}

module.exports = NotesHandler;