const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const degreeRoutes = require("./routes/degree");
const certificateRoutes = require("./routes/certificate");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/degree", degreeRoutes);
app.use("/api/certificate", certificateRoutes);

app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});