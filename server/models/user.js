"use strict";
const { Model } = require("sequelize");
const { hashPassword } = require("../helpers/bcrypt");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: "Username must be unique",
        },
        validate: {
          notEmpty: {
            args: true,
            msg: "Username cannot be empty",
          },
          isAlphanumeric: {
            args: true,
            msg: "Username must be alphanumeric",
          },
          len: {
            args: [3, 100],
            msg: "Username must be between 3 and 100 characters",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: "Email must be unique",
        },
        validate: {
          notEmpty: {
            args: true,
            msg: "Email cannot be empty",
          },
          isEmail: {
            args: true,
            msg: "Must be a valid email address",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Password cannot be empty",
          },
          len: {
            args: [6, 100],
            msg: "Password must be between 6 and 100 characters",
          },
        },
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cpm: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      hooks: {
        beforeCreate: (user, options) => {
          user.password = hashPassword(user.password);
        },
      },
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
