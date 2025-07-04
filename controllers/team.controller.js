const Team = require('../models/team.model');

// Create a new team member
exports.createTeam = async (req, res) => {
  try {
    const { name, occupation, title, image, comment, affiliation, status, twitter_url, facebook_url, linkedin_url, instagram_url } = req.body;
    
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
      status,
      twitter_url, 
      facebook_url, 
      linkedin_url, 
      instagram_url
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
    const { name, occupation, title, image, comment, affiliation, status, twitter_url, facebook_url, linkedin_url, instagram_url } = req.body;


    const team = await Team.findByPk(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Validate status if provided
    if (status && !['CURRENT', 'PAST', 'FUTURE', 'COLLABORATOR'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }


    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (title !== undefined) updateData.title = title;
    if (image !== undefined) updateData.image = image;
    if (comment !== undefined) updateData.comment = comment;
    if (affiliation !== undefined) updateData.affiliation = affiliation;
    if (status !== undefined) updateData.status = status;
    if (twitter_url !== undefined) updateData.twitter_url = twitter_url;
    if (facebook_url !== undefined) updateData.facebook_url = facebook_url;
    if (linkedin_url !== undefined) updateData.linkedin_url = linkedin_url;
    if (instagram_url !== undefined) updateData.instagram_url = instagram_url;


    // Update the team member
    const [updatedRowsCount] = await Team.update(updateData, {
      where: { id: req.params.id },
      returning: true
    });

    if (updatedRowsCount === 0) {
      return res.status(400).json({ error: 'No changes made to team member' });
    }

    // Fetch the updated team member
    const updatedTeam = await Team.findByPk(req.params.id);

    res.status(200).json(updatedTeam);
  } catch (error) {
    console.error('Update error:', error);
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