module.exports = app => {
  const post = require("../controllers/post.controller");
  const { authenticateToken } = require("../middleware/authenticateUser");
  const { handleImageUpload } = require('../middleware/cloudinary');

  var router = require("express").Router();

  // Create a new post post
  router.post(
    "/create-post",
    authenticateToken,
    handleImageUpload,
    post.createPost
  );

  // Get all post posts
  router.get(
    "/all-posts",
    post.getAllPosts
  );

  // Get a single post post by ID
  router.get(
    "/get-post/:id",
    post.getPostById
  );

  // Update a post post
  router.put(
    "/update-post/:id",
    authenticateToken,
    handleImageUpload,
    post.updatePost
  );

  // Delete a post post
  router.delete(
    "/delete-post/:id",
    authenticateToken,
    post.deletePost
  );

  app.use('/api/posts', router);
};