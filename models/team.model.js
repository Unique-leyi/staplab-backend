const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Team = sequelize.define('Team', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  occupation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT, 
    allowNull: false
  },
  affiliation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('CURRENT', 'PAST', 'FUTURE', 'COLLABORATOR'),
    allowNull: false,
    defaultValue: 'CURRENT' 
  },
  twitter_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  facebook_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  linkedin_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  instagram_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, {
  timestamps: true, 
  tableName: 'Teams' 
});


Team.associate = (models) => {

};

module.exports = Team;