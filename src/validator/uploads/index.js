const InvariantError = require('../../exeptions/InvariantError');
const { ImageHeaderSchema } = require('./schema');

const uploadsValidator = {
  validateImageHeaders: (header) => {
    const validationResult = ImageHeaderSchema.validate(header);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  }
};

module.exports = uploadsValidator;