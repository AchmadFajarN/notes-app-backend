const ExportNotePayloadSchema = require('./schema');
const InvariantError = require('../../exeptions/InvariantError');

const ExportValidator = {
  validateExportNotesPayload: (payload) => {
    const validationResult = ExportNotePayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  }
};

module.exports = ExportValidator;