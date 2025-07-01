const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false
});

// Authenticate and export the instance
(async () => {
  try {
    await sequelize.authenticate();
    console.log(`Database connected: ${process.env.DB_NAME}`);
  } catch (err) {
    console.error(`Connection error: ${err.message}`);
    process.exit(1);
  }
})();

module.exports = sequelize;