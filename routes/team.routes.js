module.exports = app => {
  const team = require("../controllers/team.controller");
  const { authenticateToken } = require("../middleware/authenticateUser");

  var router = require("express").Router();

  // Create a new team member
  router.post(
    "/create-team",
    authenticateToken,
    team.createTeam
  );

  // Get all team members
  router.get(
    "/all-teams",
    team.getAllTeams
  );

  // Get a single team member by ID
  router.get(
    "/get-team/:id",
    team.getTeamById
  );

  // Update a team member
  router.put(
    "/update-team/:id",
    authenticateToken,
    team.updateTeam
  );

  // Delete a team member
  router.delete(
    "/delete-team/:id",
    authenticateToken,
    team.deleteTeam
  );

  app.use('/api/teams', router);
};