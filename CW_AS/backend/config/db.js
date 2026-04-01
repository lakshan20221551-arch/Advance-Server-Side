const sql = require("mssql");
require("dotenv").config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(async pool => {
        console.log("SQL Server Connected");

        // Create API_KEYS table if it doesn't exist
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='API_KEYS' AND xtype='U')
            CREATE TABLE API_KEYS (
                KeyID INT IDENTITY(1,1) PRIMARY KEY,
                UserID INT,
                ClientName VARCHAR(255),
                ApiKey VARCHAR(255) UNIQUE NOT NULL,
                IsRevoked BIT DEFAULT 0,
                CreatedAt DATETIME DEFAULT GETDATE()
            )
        `);

        // Create API_KEY_USAGE table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='API_KEY_USAGE' AND xtype='U')
            CREATE TABLE API_KEY_USAGE (
                UsageID INT IDENTITY(1,1) PRIMARY KEY,
                KeyID INT,
                EndpointAccessed VARCHAR(255),
                IPAddress VARCHAR(255),
                AccessedAt DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (KeyID) REFERENCES API_KEYS(KeyID) ON DELETE CASCADE
            )
        `);

        // Create LOGIN_STATS table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='LOGIN_STATS' AND xtype='U')
            CREATE TABLE LOGIN_STATS (
                StatID INT IDENTITY(1,1) PRIMARY KEY,
                Email VARCHAR(255),
                IPAddress VARCHAR(255),
                LoginTime DATETIME DEFAULT GETDATE(),
                Status VARCHAR(50)
            )
        `);

        return pool;
    })
    .catch(err => console.log(err));

module.exports = {
    sql,
    poolPromise
};