const { OAuth2Client } = require("google-auth-library");
const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { generateToken } = require("../helpers/jwt");
const generateRandomWordsByAi = require("../helpers/gemini");
const { text } = require("express");

class Controller {
  static async postLogin(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        throw new Error("EMPTY_USERNAME_PASSWORD");
      }

      const foundUser = await User.findOne({
        where: {
          username,
        },
      });

      if (!foundUser || !comparePassword(password, foundUser.password)) {
        throw new Error("INVALID_CREDENTIALS");
      }

      const access_token = generateToken({
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        imageUrl: foundUser.imageUrl,
      });

      res.status(200).json({
        access_token,
      });
    } catch (error) {
      next(error);
    }
  }

  static async postGoogleLogin(req, res, next) {
    try {
      const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

      const { google_token } = req.headers;

      if (!google_token) {
        throw new Error("EMPTY_GOOGLE_ACCESS_TOKEN");
      }

      const client = new OAuth2Client(GOOGLE_CLIENT_ID);

      const ticket = await client.verifyIdToken({
        idToken: google_token,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      const [user, created] = await User.findOrCreate({
        where: {
          email: payload.email,
        },
        defaults: {
          username: payload.email.split("@")[0],
          email: payload.email,
          password: "password_google",
          imageUrl: payload.picture,
        },
        hooks: false,
      });

      const access_token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        imageUrl: user.imageUrl,
      });

      res.status(200).json({
        access_token,
      });
    } catch (error) {
      next(error);
    }
  }

  static async postRegister(req, res, next) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        throw new Error("EMPTY_USERNAME_EMAIL_PASSWORD");
      }

      const createdUser = await User.create({
        username,
        email,
        password,
      });

      res.status(201).json({
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        imageUrl: createdUser.imageUrl,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserByCpmDesc(req, res, next) {
    try {
      const users = await User.findAll({
        order: [["cpm", "DESC"]],
        attributes: ["id", "username", "email", "imageUrl", "cpm"],
      });

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  static async patchUserByCpm(req, res, next) {
    try {
      const { id } = req.params;
      const { cpm } = req.body;

      if (!cpm) {
        throw new Error("EMPTY_CPM");
      }

      const [updatedRows, updatedUsers] = await User.update(
        { cpm },
        {
          where: { id },
          returning: true,
        }
      );

      if (updatedRows === 0) {
        throw new Error("INVALID_ID");
      }

      res.status(200).json(updatedUsers[0]);
    } catch (error) {
      next(error);
    }
  }

  static async generateRandomWords(req, res, next) {
    try {
      const randomWords = await generateRandomWordsByAi();

      const formattedWords = randomWords.replace(/[\r\n]+/g, " ");
      // .split(": ")[1];

      res.status(200).json({
        text: formattedWords,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
