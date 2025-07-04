const Research = require('../models/research.model');
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

// Create a new research entry
exports.createResearch = async (req, res) => {
  try {
    const { title, url, image, imagePublicId, category, content, author, paragraphs } = req.body;

    // Validate required fields
    if (!title || !url || !image || !category || !content || !author) {
      return res.status(400).json({ 
        error: 'All required fields must be provided. Make sure to upload an image.' 
      });
    }

    // Parse and validate paragraphs
    let parsedParagraphs = [];
    try {
      parsedParagraphs = parseParagraphs(paragraphs);
    } catch (error) {
      return res.status(400).json({ error: error.message });
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
      author,
      paragraphs: parsedParagraphs
    });

    res.status(201).json(research);
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

// Get all research entries
exports.getAllResearch = async (req, res) => {
  try {
    const research = await Research.findAll({
      attributes: { exclude: ['imagePublicId'] } 
    });
    
    // Remove imagePublicId from paragraphs in each research entry
    const sanitizedResearch = research.map(item => {
      const researchData = item.toJSON();
      if (researchData.paragraphs && Array.isArray(researchData.paragraphs)) {
        researchData.paragraphs = researchData.paragraphs.map(paragraph => {
          const { imagePublicId, ...sanitizedParagraph } = paragraph;
          return sanitizedParagraph;
        });
      }
      return researchData;
    });
    
    res.status(200).json(sanitizedResearch);
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
    
    const researchData = research.toJSON();
    
    // Remove imagePublicId from paragraphs
    if (researchData.paragraphs && Array.isArray(researchData.paragraphs)) {
      researchData.paragraphs = researchData.paragraphs.map(paragraph => {
        const { imagePublicId, ...sanitizedParagraph } = paragraph;
        return sanitizedParagraph;
      });
    }
    
    res.status(200).json(researchData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a research entry
exports.updateResearch = async (req, res) => {
  try {
    const { title, url, image, imagePublicId, category, content, author, paragraphs } = req.body;
    const research = await Research.findByPk(req.params.id);

    if (!research) {
      return res.status(404).json({ error: 'Research not found' });
    }

    let oldImagePublicId = null;
    let oldParagraphImages = [];

    // If a new image was uploaded, we need to delete the old one
    if (image && image !== research.image) {
      oldImagePublicId = research.imagePublicId;
    }

    // Parse and validate paragraphs
    let parsedParagraphs = research.paragraphs;
    if (paragraphs !== undefined) {
      try {
        parsedParagraphs = parseParagraphs(paragraphs);
        
        // Get old paragraph images that need to be deleted
        const oldParagraphImageIds = getParagraphImagePublicIds(research.paragraphs);
        const newParagraphImageIds = getParagraphImagePublicIds(parsedParagraphs);
        
        // Find images that are in old but not in new (to be deleted)
        oldParagraphImages = oldParagraphImageIds.filter(id => !newParagraphImageIds.includes(id));
        
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
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
      author: author || research.author,
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

    // Return research without exposing imagePublicId
    const { imagePublicId: _, ...researchData } = research.toJSON();
    
    // Remove imagePublicId from paragraphs
    if (researchData.paragraphs && Array.isArray(researchData.paragraphs)) {
      researchData.paragraphs = researchData.paragraphs.map(paragraph => {
        const { imagePublicId, ...sanitizedParagraph } = paragraph;
        return sanitizedParagraph;
      });
    }
    
    res.status(200).json(researchData);
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

// Delete a research entry
exports.deleteResearch = async (req, res) => {
  try {
    const research = await Research.findByPk(req.params.id);
    
    if (!research) {
      return res.status(404).json({ error: 'Research not found' });
    }

    const imagesToDelete = [];

    // Add main image to deletion list
    if (research.imagePublicId) {
      imagesToDelete.push(research.imagePublicId);
    }

    // Add paragraph images to deletion list
    if (research.paragraphs && Array.isArray(research.paragraphs)) {
      imagesToDelete.push(...getParagraphImagePublicIds(research.paragraphs));
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

    await research.destroy();
    res.status(200).json({ message: "Research deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};