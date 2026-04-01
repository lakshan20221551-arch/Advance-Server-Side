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

const apiKeysRoutes = require("./routes/apiKeys");
const publicApiRoutes = require("./routes/publicApi");

require("./cron/winnerCron")

const swaggerJsDoc = require("swagger-jsdoc");
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
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Alumni Influencers API',
            version: '1.0.0',
            description: 'API documentation for the Alumni Influencers backend.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'API_KEY'
                }
            }
        }
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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

module.exports = app