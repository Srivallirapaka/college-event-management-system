const express = require("express");
const app = express();
const { connectDB } = require("./db");
const EventRoutes = require("./routes/EventRoutes");
const cors = require("cors");

app.use(cors());
app.use(express.json());

// Initialize database connection
connectDB().then(() => {
  app.use("/events", EventRoutes);
}).catch(err => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});

app.get("/", (req, res) => {
  res.send("API Running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});