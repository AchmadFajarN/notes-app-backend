const InvariantError = require('../../exeptions/InvariantError');
const { CollaborationsPayloadSchema } = require('./schema');

const CollaborationsValidator = {
  validateCollaborationPayload: (payload) => {
    const validateResult = CollaborationsPayloadSchema.validate(payload);

    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  }
};

module.exports = CollaborationsValidator;