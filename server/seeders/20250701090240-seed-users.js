"use strict";

const { hashPassword } = require("../helpers/bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    await queryInterface.bulkInsert("Users", [
      {
        username: "harta",
        email: "harta@mail.com",
        password: hashPassword("123456"),
        imageUrl: "https://i.pravatar.cc/150?img=1",
        cpm: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "andy",
        email: "andy@mail.com",
        password: hashPassword("123456"),
        imageUrl: "https://i.pravatar.cc/150?img=1",
        cpm: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete("Users", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
  },
};
