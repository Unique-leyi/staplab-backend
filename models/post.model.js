const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

const Post = sequelize.define('Post', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true 
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Cloudinary image URL'
  },
  imagePublicId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Cloudinary public ID for image deletion'
  },
  content: {
    type: DataTypes.TEXT, 
    allowNull: false
  },
  authors: {
    type: DataTypes.JSON, 
    allowNull: false,
    defaultValue: []
  },
  paragraphs: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of paragraph objects with content, image, imageCaption, and imagePublicId'
  }
}, {
  timestamps: true, 
  tableName: 'Posts' 
});

Post.associate = (models) => {
  // Add associations here when needed
};

module.exports = Post;