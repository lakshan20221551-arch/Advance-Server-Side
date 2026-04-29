require("dotenv").config()

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")

const authRoutes = require("./routes/auth")
const profileRoutes = require("./routes/profile")
const licenseRoutes = require("./routes/licenses")
const shortCourseRoutes = require("./routes/shortCourses")
const employmentRoutes = require("./routes/employmentHistory")
const degreeRoutes = require("./routes/degree")
const certificateRoutes = require("./routes/certificate")
const bidRoutes = require("./routes/bids") // Re-added
const alumniRoutes = require("./routes/alumni");

const apiKeysRoutes = require("./routes/apiKeys");
const publicApiRoutes = require("./routes/publicApi");
const analyticsRoutes = require("./routes/analyticsRoutes");
const donationRoutes = require("./routes/donations");

require("./cron/winnerCron")

const swaggerUi = require("swagger-ui-express");

const app = express()

app.use(cors())
app.use(helmet())

app.use(express.json())

app.use(rateLimit({
windowMs:15*60*1000,
max:100
}))

// Swagger Setup
const swaggerDocument = require("./utils/swagger.json");
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/auth",authRoutes)
app.use("/api/profile",profileRoutes)
app.use("/api/certificate",certificateRoutes)
app.use("/api/bids",bidRoutes)
app.use("/api/degree",degreeRoutes)
app.use("/api/license",licenseRoutes)
app.use("/api/short-course",shortCourseRoutes)
app.use("/api/employment",employmentRoutes)

app.use("/api/api-keys", apiKeysRoutes)
app.use("/api/public", publicApiRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/donations", donationRoutes)
app.use("/api/alumni", alumniRoutes)

module.exports = app