class CollaborationHandler {
  constructor(collaborationService, noteService, validator) {
    this._collaborationService = collaborationService;
    this._noteService = noteService;
    this._validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(req, h) {
    this._validator.validateCollaborationPayload(req.payload);
    const { id: credentialId } = req.auth.credentials;
    const { noteId, userId } = req.payload;

    await this._noteService.verifyNoteOwner(noteId, credentialId);
    const collaborationId = await this._collaborationService.addCollaborator(noteId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId
      }
    });

    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(req) {
    this._validator.validateCollaborationPayload(req.payload);
    const { id: credentialId  } = req.auth.credentials;
    const { noteId, userId } = req.payload;

    await this._noteService.verifyNoteOwner(noteId, credentialId);
    await this._collaborationService.deleteCollaborator(noteId, userId);

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus'
    };
  }
}

module.exports = CollaborationHandler;