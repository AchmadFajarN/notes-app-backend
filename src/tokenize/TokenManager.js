const Jwt = require('@hapi/jwt');
const InvariantError = require('../exeptions/InvariantError');

const TokenManager = {
  generateAccessToken: (payload) => Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),
  generateRefreshToken: (payload) => Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
      const { payload } = artifacts.decoded;
      return payload;
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      throw new InvariantError('Refresh tidak valid');
    }
  }
};

module.exports = TokenManager;