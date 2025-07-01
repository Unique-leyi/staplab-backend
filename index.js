const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db.js"); 
const config = require("./config/index.js");
const cookieParser = require("cookie-parser");

const app = express();
const { port } = config;

// Middleware
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(express.json({ limit: "25mb" }));
app.use(
  cors({
    origin: "*",
  })
);
app.use(cookieParser());


require("./routes/user.routes.js")(app);
require("./routes/team.routes.js")(app);
require("./routes/research.routes.js")(app);
require("./routes/post.routes.js")(app);


app.get("/", (req, res) => {
  res.send({ message: "Hello from an Express API!" });
});

// Start server
app.listen(port, async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('Database models synced');
    console.log(`Server running at http://localhost:${port}`);
  } catch (err) {
    console.error('Error syncing database:', err.message);
  }
});