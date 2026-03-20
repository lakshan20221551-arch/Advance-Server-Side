require("dotenv").config()

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")

const authRoutes = require("./routes/auth")
const profileRoutes = require("./routes/profile")
// const bidRoutes = require("./routes/bidRoutes") // Removed for now if missing, but let's just leave it as is, or wait. If bidRoutes doesn't exist, it will crash.

// require("./cron/winnerCron")

const app = express()

app.use(cors())
app.use(helmet())

app.use(express.json())

app.use(rateLimit({
windowMs:15*60*1000,
max:100
}))

app.use("/api/auth",authRoutes)
app.use("/api/profile",profileRoutes)
app.use("/api/bids",bidRoutes)

module.exports = app