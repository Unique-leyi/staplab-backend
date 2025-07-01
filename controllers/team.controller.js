const Team = require('../models/team.model');

// Create a new team member
exports.createTeam = async (req, res) => {
  try {
    const { name, occupation, title, image, comment, affiliation, status } = req.body;
    
    // Validate required fields
    if (!name || !occupation || !title || !image || !comment || !affiliation || !status) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate status
    if (!['CURRENT', 'PAST', 'FUTURE', 'COLLABORATOR'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const team = await Team.create({
      name,
      occupation,
      title,
      image,
      comment,
      affiliation,
      status
    });

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all team members
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.findAll();
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single team member by ID
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a team member
exports.updateTeam = async (req, res) => {
  try {
    const { name, occupation, title, image, comment, affiliation, status } = req.body;
    const team = await Team.findByPk(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Validate status if provided
    if (status && !['CURRENT', 'PAST', 'FUTURE', 'COLLABORATOR'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    await team.update({
      name: name || team.name,
      occupation: occupation || team.occupation,
      title: title || team.title,
      image: image || team.image,
      comment: comment || team.comment,
      affiliation: affiliation || team.affiliation,
      status: status || team.status
    });

    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a team member
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    await team.destroy();
    res.status(200).json({ message: "Team deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};