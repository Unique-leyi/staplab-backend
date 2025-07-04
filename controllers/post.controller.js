const Post = require('../models/post.model');
const { deleteImage, extractPublicId } = require('../middleware/cloudinary');

// Helper function to parse and validate paragraphs
const parseParagraphs = (paragraphs) => {
  if (!paragraphs) return [];
  
  let parsedParagraphs = paragraphs;
  if (typeof paragraphs === 'string') {
    try {
      parsedParagraphs = JSON.parse(paragraphs);
    } catch (error) {
      throw new Error('Invalid paragraphs format. Paragraphs must be a valid JSON array.');
    }
  }

  if (!Array.isArray(parsedParagraphs)) {
    throw new Error('Paragraphs must be an array.');
  }

  // Validate each paragraph object
  for (const paragraph of parsedParagraphs) {
    if (typeof paragraph !== 'object' || paragraph === null) {
      throw new Error('Each paragraph must be an object.');
    }
    
    // Extract public_id from image URL if not provided
    if (paragraph.image && !paragraph.imagePublicId) {
      paragraph.imagePublicId = extractPublicId(paragraph.image);
    }
  }

  return parsedParagraphs;
};

// Helper function to get all image public IDs from paragraphs
const getParagraphImagePublicIds = (paragraphs) => {
  if (!paragraphs || !Array.isArray(paragraphs)) return [];
  
  return paragraphs
    .filter(p => p.imagePublicId)
    .map(p => p.imagePublicId);
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, url, image, imagePublicId, content, authors, paragraphs } = req.body;

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

    // Parse and validate paragraphs
    let parsedParagraphs = [];
    try {
      parsedParagraphs = parseParagraphs(paragraphs);
    } catch (error) {
      return res.status(400).json({ error: error.message });
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
      authors: parsedAuthors,
      paragraphs: parsedParagraphs
    });

    res.status(201).json(post);
  } catch (error) {
    // If there's an error and we have uploaded images, clean them up
    const imagesToCleanup = [];
    
    // Main image cleanup
    if (req.body.imagePublicId || req.body.image) {
      const publicId = req.body.imagePublicId || extractPublicId(req.body.image);
      if (publicId) imagesToCleanup.push(publicId);
    }
    
    // Paragraph images cleanup
    if (req.body.paragraphs) {
      try {
        const parsedParagraphs = parseParagraphs(req.body.paragraphs);
        imagesToCleanup.push(...getParagraphImagePublicIds(parsedParagraphs));
      } catch (parseError) {
        // If parsing fails, we can't clean up paragraph images
      }
    }
    
    // Clean up all images
    for (const publicId of imagesToCleanup) {
      try {
        await deleteImage(publicId);
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
    
    // Remove imagePublicId from paragraphs in each post
    const sanitizedPosts = posts.map(post => {
      const postData = post.toJSON();
      if (postData.paragraphs && Array.isArray(postData.paragraphs)) {
        postData.paragraphs = postData.paragraphs.map(paragraph => {
          const { imagePublicId, ...sanitizedParagraph } = paragraph;
          return sanitizedParagraph;
        });
      }
      return postData;
    });
    
    res.status(200).json(sanitizedPosts);
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
    
    const postData = post.toJSON();
    
    // Remove imagePublicId from paragraphs
    if (postData.paragraphs && Array.isArray(postData.paragraphs)) {
      postData.paragraphs = postData.paragraphs.map(paragraph => {
        const { imagePublicId, ...sanitizedParagraph } = paragraph;
        return sanitizedParagraph;
      });
    }
    
    res.status(200).json(postData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const { title, url, image, imagePublicId, content, authors, paragraphs } = req.body;
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    let oldImagePublicId = null;
    let oldParagraphImages = [];

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

    // Parse and validate paragraphs
    let parsedParagraphs = post.paragraphs;
    if (paragraphs !== undefined) {
      try {
        parsedParagraphs = parseParagraphs(paragraphs);
        
        // Get old paragraph images that need to be deleted
        const oldParagraphImageIds = getParagraphImagePublicIds(post.paragraphs);
        const newParagraphImageIds = getParagraphImagePublicIds(parsedParagraphs);
        
        // Find images that are in old but not in new (to be deleted)
        oldParagraphImages = oldParagraphImageIds.filter(id => !newParagraphImageIds.includes(id));
        
      } catch (error) {
        return res.status(400).json({ error: error.message });
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
      authors: parsedAuthors && Array.isArray(parsedAuthors) ? parsedAuthors : post.authors,
      paragraphs: parsedParagraphs
    });

    // Delete old main image if it was replaced
    if (oldImagePublicId) {
      try {
        await deleteImage(oldImagePublicId);
      } catch (deleteError) {
        console.error('Error deleting old image:', deleteError);
      }
    }

    // Delete old paragraph images that are no longer used
    for (const publicId of oldParagraphImages) {
      try {
        await deleteImage(publicId);
      } catch (deleteError) {
        console.error('Error deleting old paragraph image:', deleteError);
      }
    }

    // Return post without exposing imagePublicId
    const { imagePublicId: _, ...postData } = post.toJSON();
    
    // Remove imagePublicId from paragraphs
    if (postData.paragraphs && Array.isArray(postData.paragraphs)) {
      postData.paragraphs = postData.paragraphs.map(paragraph => {
        const { imagePublicId, ...sanitizedParagraph } = paragraph;
        return sanitizedParagraph;
      });
    }
    
    res.status(200).json(postData);
  } catch (error) {
    // If there's an error and we have new uploaded images, clean them up
    const imagesToCleanup = [];
    
    // Main image cleanup
    if (req.body.imagePublicId || req.body.image) {
      const publicId = req.body.imagePublicId || extractPublicId(req.body.image);
      if (publicId) imagesToCleanup.push(publicId);
    }
    
    // Paragraph images cleanup
    if (req.body.paragraphs) {
      try {
        const parsedParagraphs = parseParagraphs(req.body.paragraphs);
        imagesToCleanup.push(...getParagraphImagePublicIds(parsedParagraphs));
      } catch (parseError) {
        // If parsing fails, we can't clean up paragraph images
      }
    }
    
    // Clean up all images
    for (const publicId of imagesToCleanup) {
      try {
        await deleteImage(publicId);
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

    const imagesToDelete = [];

    // Add main image to deletion list
    if (post.imagePublicId) {
      imagesToDelete.push(post.imagePublicId);
    }

    // Add paragraph images to deletion list
    if (post.paragraphs && Array.isArray(post.paragraphs)) {
      imagesToDelete.push(...getParagraphImagePublicIds(post.paragraphs));
    }

    // Delete all images from Cloudinary
    for (const publicId of imagesToDelete) {
      try {
        await deleteImage(publicId);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
        // Continue with other deletions even if one fails
      }
    }

    await post.destroy();
    res.status(200).json({ message: "Post deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};