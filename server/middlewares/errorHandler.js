const errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  console.log(error);

  if (
    error.name === "SequelizeValidationError" ||
    error.name === "SequelizeUniqueConstraintError"
  ) {
    statusCode = 400;
    message = error.errors.map((error) => error.message);
  } else if (error.message === "EMPTY_USERNAME_PASSWORD") {
    statusCode = 400;
    message = "Username or password is empty";
  } else if (error.message === "EMPTY_USERNAME_EMAIL_PASSWORD") {
    statusCode = 400;
    message = "Username, email or password is empty";
  } else if (error.message === "INVALID_CREDENTIALS") {
    statusCode = 401;
    message = "Invalid username or password";
  } else if (
    error.message === "INVALID_TOKEN" ||
    error.name === "JsonWebTokenError" ||
    error.message === "EMPTY_GOOGLE_ACCESS_TOKEN"
  ) {
    statusCode = 401;
    message = "Invalid token";
  } else if (error.message === "FORBIDDEN") {
    statusCode = 403;
    message = "Forbidden to access";
  } else if (error.message === "INVALID_ID") {
    statusCode = 404;
    message = "Error not found";
  } else if (error.message === "EMPTY_CPM") {
    statusCode = 400;
    message = "CPM cannot be empty";
  }

  res.status(statusCode).json({
    message,
  });
};

module.exports = errorHandler;
