const Post = require("../models/post.model"); 
const blogPostsData = require("./blogsData"); 

async function seedPosts() {
  try {
    // Check if Posts table is empty to avoid duplicates
    const postCount = await Post.count();
    if (postCount > 0) {
      console.log("Posts table already contains data, skipping seeding.");
      return;
    }

    // Map blogPostsData to include imagePublicId and handle authors
    const formattedPosts = blogPostsData.map((post) => {

      const imageUrl = post.image;
      const publicIdMatch = imageUrl.match(/\/v\d+\/(.*?)(?:\.\w+)?$/);
      const imagePublicId = publicIdMatch ? publicIdMatch[1] : "";

      return {
        title: post.title,
        url: post.url,
        image: post.image,
        imagePublicId: imagePublicId, 
        content: post.content,
        authors: post.authors || [], 
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    // Bulk insert the formatted data
    await Post.bulkCreate(formattedPosts, {
      validate: true,
      individualHooks: true,
    });

    console.log("Successfully seeded Posts table with data.");
  } catch (error) {
    console.error("Error seeding Posts table:", error);
  }
}

module.exports = seedPosts;