const Post = require('../models/post.model');
const { deleteImage, extractPublicId } = require('../middleware/cloudinary');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, url, image, imagePublicId, content, authors } = req.body;

    // Parse authors if it's a string
    let parsedAuthors = authors;
    if (typeof authors === 'string') {
      try {
        parsedAuthors = JSON.parse(authors);
      } catch (error) {
        return res.status(400).json({ 
          error: 'Invalid authors format. Authors must be a valid JSON array.' 
        });
      }
    }

    // Validate required fields
    if (!title || !url || !image || !content || !parsedAuthors || !Array.isArray(parsedAuthors)) {
      return res.status(400).json({ 
        error: 'All fields are required, and authors must be an array. Make sure to upload an image.' 
      });
    }

    // Extract public_id from image URL if not provided
    const finalImagePublicId = imagePublicId || extractPublicId(image);

    const post = await Post.create({
      title,
      url,
      image,
      imagePublicId: finalImagePublicId,
      content,
      authors: parsedAuthors 
    });

    res.status(201).json(post);
  } catch (error) {
    // If there's an error and we have an uploaded image, clean it up
    if (req.body.imagePublicId || req.body.image) {
      try {
        const publicId = req.body.imagePublicId || extractPublicId(req.body.image);
        if (publicId) {
          await deleteImage(publicId);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up uploaded image:', cleanupError);
      }
    }
    
    res.status(500).json({ error: error.message });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      attributes: { exclude: ['imagePublicId'] } 
    });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      attributes: { exclude: ['imagePublicId'] } 
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const { title, url, image, imagePublicId, content, authors } = req.body;
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    let oldImagePublicId = null;

    // If a new image was uploaded, we need to delete the old one
    if (image && image !== post.image) {
      oldImagePublicId = post.imagePublicId;
    }

    // Parse authors if it's a string
    let parsedAuthors = authors;
    if (typeof authors === 'string') {
      try {
        parsedAuthors = JSON.parse(authors);
      } catch (error) {
        return res.status(400).json({ 
          error: 'Invalid authors format. Authors must be a valid JSON array.' 
        });
      }
    }

    // Extract public_id from image URL if not provided
    const finalImagePublicId = imagePublicId || extractPublicId(image) || post.imagePublicId;

    // Update the post
    await post.update({
      title: title || post.title,
      url: url || post.url,
      image: image || post.image,
      imagePublicId: finalImagePublicId,
      content: content || post.content,
      authors: parsedAuthors && Array.isArray(parsedAuthors) ? parsedAuthors : post.authors
    });

    if (oldImagePublicId) {
      try {
        await deleteImage(oldImagePublicId);
      } catch (deleteError) {
        console.error('Error deleting old image:', deleteError);
      }
    }

    // Return post without exposing imagePublicId
    const { imagePublicId: _, ...postData } = post.toJSON();
    res.status(200).json(postData);
  } catch (error) {
    // If there's an error and we have a new uploaded image, clean it up
    if (req.body.imagePublicId || req.body.image) {
      try {
        const publicId = req.body.imagePublicId || extractPublicId(req.body.image);
        if (publicId) {
          await deleteImage(publicId);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up uploaded image:', cleanupError);
      }
    }
    
    res.status(500).json({ error: error.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Delete image from Cloudinary before deleting the post
    if (post.imagePublicId) {
      try {
        await deleteImage(post.imagePublicId);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
        // Continue with post deletion even if image deletion fails
      }
    }

    await post.destroy();
    res.status(200).json({ message: "Post deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};