if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const cors = require("cors");
const express = require("express");
const { createServer } = require("node:http");

const errorHandler = require("./middlewares/errorHandler");
const Controller = require("./controllers/controller");
const initializeSocket = require("./socketHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// route
app.post("/login", Controller.postLogin);
app.post("/google-login", Controller.postGoogleLogin);
app.post("/register", Controller.postRegister);

app.get("/leaderboard", Controller.getUserByCpmDesc);
app.patch("/user/:id", Controller.patchUserCpmById);
app.get("/random-words", Controller.generateRandomWords);

app.use(errorHandler);

const httpServer = createServer(app);

initializeSocket(httpServer);

module.exports = {
  httpServer,
};
