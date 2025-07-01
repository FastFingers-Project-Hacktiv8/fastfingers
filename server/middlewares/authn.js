const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models");

const isLoggedIn = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new Error("INVALID_TOKEN");
    }

    const token = authorization.split(" ")[1];

    const payload = verifyToken(token);

    const foundUser = await User.findByPk(payload.id);

    if (!foundUser) {
      throw new Error("INVALID_TOKEN");
    }

    req.user = {
      id: foundUser.id,
      username: foundUser.username,
      email: foundUser.email,
      imageUrl: foundUser.imageUrl,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = isLoggedIn;
