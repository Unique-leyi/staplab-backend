module.exports = app => {
  const research = require("../controllers/research.controller");
  const { authenticateToken } = require("../middleware/authenticateUser");
    const { handleImageUpload } = require('../middleware/cloudinary');

  var router = require("express").Router();

  // Create a new research entry
  router.post(
    "/create-research",
    authenticateToken,
    handleImageUpload,
    research.createResearch
  );

  // Get all research entries
  router.get(
    "/all-researchs",
    research.getAllResearch
  );

  // Get a single research entry by ID
  router.get(
    "/get-research/:id",
    research.getResearchById
  );

  // Update a research entry
  router.put(
    "/update-research/:id",
    authenticateToken,
    handleImageUpload,
    research.updateResearch
  );

  // Delete a research entry
  router.delete(
    "/delete-research/:id",
    authenticateToken,
    research.deleteResearch
  );

  app.use('/api/researchs', router);
};