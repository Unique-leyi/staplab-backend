const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Research = sequelize.define('Research', {
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
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT, 
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true, 
  tableName: 'Researchs' 
});

Research.associate = (models) => {
  // Add associations here when needed
};

module.exports = Research;