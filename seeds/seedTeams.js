const Team = require("../models/team.model");
const teamsData = require("./teamsData");

async function seedTeams() {
  try {

    const teamCount = await Team.count();
    if (teamCount > 0) {
      console.log("Teams table already contains data, skipping seeding.");
      return;
    }

    // Map teamsData to include imagePublicId and handle status
    const formattedTeams = teamsData.map((team) => {

      const imageUrl = team.image;
      const publicIdMatch = imageUrl.match(/\/v\d+\/(.*?)(?:\.\w+)?$/);
      const imagePublicId = publicIdMatch ? publicIdMatch[1] : "";

      return {
        name: team.name,
        occupation: team.occupation,
        title: team.title,
        image: team.image,
        imagePublicId: imagePublicId, 
        comment: team.comment,
        affiliation: team.affiliation,
        status: team.isPast ? "PAST" : team.occupation === "Collaborator" ? "COLLABORATOR" : "CURRENT",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    // Bulk insert the formatted data
    await Team.bulkCreate(formattedTeams, {
      validate: true,
      individualHooks: true,
    });

    console.log("Successfully seeded Teams table with data.");
  } catch (error) {
    console.error("Error seeding Teams table:", error);
  }
}

module.exports = seedTeams;