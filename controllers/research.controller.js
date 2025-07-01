const Research = require('../models/research.model');
const { deleteImage, extractPublicId } = require('../middleware/cloudinary');

// Create a new research entry
exports.createResearch = async (req, res) => {
  try {
    const { title, url, image, imagePublicId, category, content, author } = req.body;

    // Validate required fields
    if (!title || !url || !image || !category || !content || !author) {
      return res.status(400).json({ 
        error: 'All fields are required. Make sure to upload an image.' 
      });
    }

    // Extract public_id from image URL if not provided
    const finalImagePublicId = imagePublicId || extractPublicId(image);

    const research = await Research.create({
      title,
      url,
      image,
      imagePublicId: finalImagePublicId,
      category,
      content,
      author
    });

    res.status(201).json(research);
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

// Get all research entries
exports.getAllResearch = async (req, res) => {
  try {
    const research = await Research.findAll({
      attributes: { exclude: ['imagePublicId'] } 
    });
    res.status(200).json(research);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single research entry by ID
exports.getResearchById = async (req, res) => {
  try {
    const research = await Research.findByPk(req.params.id, {
      attributes: { exclude: ['imagePublicId'] } 
    });
    if (!research) {
      return res.status(404).json({ error: 'Research not found' });
    }
    res.status(200).json(research);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a research entry
exports.updateResearch = async (req, res) => {
  try {
    const { title, url, image, imagePublicId, category, content, author } = req.body;
    const research = await Research.findByPk(req.params.id);

    if (!research) {
      return res.status(404).json({ error: 'Research not found' });
    }

    let oldImagePublicId = null;

    // If a new image was uploaded, we need to delete the old one
    if (image && image !== research.image) {
      oldImagePublicId = research.imagePublicId;
    }

    // Extract public_id from image URL if not provided
    const finalImagePublicId = imagePublicId || extractPublicId(image) || research.imagePublicId;

    // Update the research entry
    await research.update({
      title: title || research.title,
      url: url || research.url,
      image: image || research.image,
      imagePublicId: finalImagePublicId,
      category: category || research.category,
      content: content || research.content,
      author: author || research.author
    });

    // Delete the old image from Cloudinary if it was replaced
    if (oldImagePublicId) {
      try {
        await deleteImage(oldImagePublicId);
      } catch (deleteError) {
        console.error('Error deleting old image:', deleteError);
      }
    }

    // Return research without exposing imagePublicId
    const { imagePublicId: _, ...researchData } = research.toJSON();
    res.status(200).json(researchData);
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

// Delete a research entry
exports.deleteResearch = async (req, res) => {
  try {
    const research = await Research.findByPk(req.params.id);
    
    if (!research) {
      return res.status(404).json({ error: 'Research not found' });
    }

    // Delete image from Cloudinary before deleting the research entry
    if (research.imagePublicId) {
      try {
        await deleteImage(research.imagePublicId);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
        // Continue with research deletion even if image deletion fails
      }
    }

    await research.destroy();
    res.status(200).json({ message: "Research deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};