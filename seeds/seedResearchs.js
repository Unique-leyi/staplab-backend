const Research = require("../models/research.model"); 
const projectsData = require("./researchData"); 

async function seedResearch() {
  try {
    // Check if Researchs table is empty to avoid duplicates
    const researchCount = await Research.count();
    if (researchCount > 0) {
      console.log("Researchs table already contains data, skipping seeding.");
      return;
    }

    // Map projectsData to include imagePublicId
    const formattedResearch = projectsData.map((project) => {

      const imageUrl = project.image;
      const publicIdMatch = imageUrl.match(/\/v\d+\/(.*?)(?:\.\w+)?$/);
      const imagePublicId = publicIdMatch ? publicIdMatch[1] : "";

      return {
        title: project.title,
        url: project.url,
        image: project.image,
        imagePublicId: imagePublicId, 
        category: project.category,
        content: project.content,
        author: project.author,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    // Bulk insert the formatted data
    await Research.bulkCreate(formattedResearch, {
      validate: true,
      individualHooks: true,
    });

    console.log("Successfully seeded Researchs table with data.");
  } catch (error) {
    console.error("Error seeding Researchs table:", error);
  }
}

module.exports = seedResearch;