module.exports = app => {
  const user = require("../controllers/user.controller");
  const { authenticateToken } = require("../middleware/authenticateUser");

  var router = require("express").Router();

  // Create a new user
  router.post(
    "/create-user",
    authenticateToken,
    user.createUser
  );

  // Get all users
  router.get(
    "/all-users",
    authenticateToken,
    user.getAllUsers
  );

  router.get(
    "/me",
    authenticateToken,
    user.getAuthUser,
  );

  // Get a single user by ID
  router.get(
    "/get-user/:id",
    authenticateToken,
    user.getUserById
  );

  // Update a user
  router.put(
    "/update-user/:id",
    authenticateToken,
    user.updateUser
  );

  // Delete a user
  router.delete(
    "/delete-user/:id",
    authenticateToken,
    user.deleteUser
  );


  router.post(
    "/login",
    user.loginUser
  );

  router.post(
    "/reset-password",
    user.resetPassword
  );

  app.use('/api/users', router);
};