-- Alumni Influencers Database Schema
-- Student ID: w1956194
-- Database: SQL Server (MSSQL)

-- 1. Users & Authentication
CREATE TABLE AAP_USERS_DETAILS (
    aud_id INT PRIMARY KEY IDENTITY(1,1),
    aud_email VARCHAR(1000) NOT NULL UNIQUE,
    aud_password VARCHAR(4000) NOT NULL,
    aud_role VARCHAR(50) DEFAULT 'user',
    aud_is_verified BIT DEFAULT 0,
    aud_status VARCHAR(50) NULL, -- 'A' for Admin, NULL for regular users
    aud_verify_token VARCHAR(255) NULL,
    aud_verify_token_expiry DATETIME NULL,
    aud_reset_token VARCHAR(255) NULL,
    aud_reset_token_expiry DATETIME NULL,
    aud_created_date DATETIME DEFAULT GETDATE()
);

-- 2. User Profiles
CREATE TABLE AAP_PROFILES_DETAILS (
    apd_id INT PRIMARY KEY IDENTITY(1,1),
    apd_user_id INT NOT NULL,
    apd_full_name VARCHAR(4000) NULL,
    apd_bio VARCHAR(4000) NULL,
    apd_linkedIn_url VARCHAR(MAX) NULL,
    apd_profile_image IMAGE NULL,
    apd_is_featured BIT DEFAULT 0,
    apd_created_date DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (apd_user_id) REFERENCES AAP_USERS_DETAILS(aud_id) ON DELETE CASCADE
);

-- 3. Academic & Professional Details (Tables behind Views)
CREATE TABLE AAP_DEGREE_DETAILS (
    adv_degree_id INT PRIMARY KEY IDENTITY(1,1),
    adv_user_id INT NOT NULL,
    adv_degree_name VARCHAR(1000) NOT NULL,
    adv_institution VARCHAR(1000) NOT NULL,
    adv_start_date DATETIME NULL,
    adv_end_date DATETIME NULL,
    FOREIGN KEY (adv_user_id) REFERENCES AAP_USERS_DETAILS(aud_id) ON DELETE CASCADE
);

CREATE TABLE AAP_EMPLOYMENT_HISTORY (
    aev_history_id INT PRIMARY KEY IDENTITY(1,1),
    aev_user_id INT NOT NULL,
    aev_company VARCHAR(1000) NOT NULL,
    aev_position VARCHAR(1000) NOT NULL,
    aev_start_date DATETIME NULL,
    aev_end_date DATETIME NULL,
    FOREIGN KEY (aev_user_id) REFERENCES AAP_USERS_DETAILS(aud_id) ON DELETE CASCADE
);

CREATE TABLE AAP_CERTIFICATE_DETAILS (
    acv_certification_id INT PRIMARY KEY IDENTITY(1,1),
    acv_user_id INT NOT NULL,
    acv_certification_name VARCHAR(1000) NOT NULL,
    acv_issuing_organization VARCHAR(1000) NOT NULL,
    acv_issue_date DATETIME NULL,
    FOREIGN KEY (acv_user_id) REFERENCES AAP_USERS_DETAILS(aud_id) ON DELETE CASCADE
);

CREATE TABLE AAP_SHORT_COURSES (
    asv_course_id INT PRIMARY KEY IDENTITY(1,1),
    asv_user_id INT NOT NULL,
    asv_name VARCHAR(1000) NOT NULL,
    asv_provider VARCHAR(1000) NULL,
    asv_completion_date DATETIME NULL,
    FOREIGN KEY (asv_user_id) REFERENCES AAP_USERS_DETAILS(aud_id) ON DELETE CASCADE
);

-- 4. Bidding & Recognition System
CREATE TABLE AAP_BIDS (
    ab_bid_id INT PRIMARY KEY IDENTITY(1,1),
    ab_profile_id INT NOT NULL,
    ab_target_date DATE NOT NULL,
    ab_amount DECIMAL(18, 2) NOT NULL,
    ab_status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Winner', 'Lost', 'Cancelled'
    ab_created_date DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ab_profile_id) REFERENCES AAP_PROFILES_DETAILS(apd_id)
);

CREATE TABLE AAP_ALUMNIOFTHE_DAY (
    adw_win_id INT PRIMARY KEY IDENTITY(1,1),
    adw_profile_id INT NOT NULL,
    adw_selection_date DATE NOT NULL,
    adw_winning_amount DECIMAL(18, 2) NOT NULL,
    adw_status VARCHAR(50) DEFAULT 'Active',
    FOREIGN KEY (adw_profile_id) REFERENCES AAP_PROFILES_DETAILS(apd_id)
);

-- 5. API Security & Stats
CREATE TABLE AAP_API_KEYS (
    aak_key_id INT PRIMARY KEY IDENTITY(1,1),
    aak_user_id INT NOT NULL,
    aak_name VARCHAR(255) NOT NULL,
    aak_api_key VARCHAR(255) NOT NULL UNIQUE,
    aak_scopes VARCHAR(1000) DEFAULT 'read:analytics',
    aak_is_revoked BIT DEFAULT 0,
    aak_created_date DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (aak_user_id) REFERENCES AAP_USERS_DETAILS(aud_id)
);

CREATE TABLE AAP_APIKEY_USAGE (
    aau_usage_id INT PRIMARY KEY IDENTITY(1,1),
    aau_key_id INT NOT NULL,
    aau_endpoint_accessed VARCHAR(1000) NOT NULL,
    aau_ip_address VARCHAR(50) NULL,
    aau_accessed_date DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (aau_key_id) REFERENCES AAP_API_KEYS(aak_key_id)
);

CREATE TABLE AAP_LOGIN_STATS (
    als_stat_id INT PRIMARY KEY IDENTITY(1,1),
    als_email VARCHAR(1000) NOT NULL,
    als_ip_address VARCHAR(50) NULL,
    als_status VARCHAR(255) NULL,
    als_login_time DATETIME DEFAULT GETDATE()
);

CREATE TABLE AAP_TOKEN_BLACKLIST (
    atb_id INT PRIMARY KEY IDENTITY(1,1),
    atb_token VARCHAR(1000) NOT NULL,
    atb_expires_at DATETIME NOT NULL
);

-- 6. Views (Examples used in Controllers)
GO
CREATE VIEW AAP_USERSDETAILS_VIEW AS
SELECT aud_id AS auv_id, aud_email AS auv_email, aud_role AS auv_role FROM AAP_USERS_DETAILS;
GO

CREATE VIEW AAP_DEGREEDETAILS_VIEW AS
SELECT * FROM AAP_DEGREE_DETAILS;
GO

CREATE VIEW AAP_EMPLOYMENTHISTORY_VIEW AS
SELECT * FROM AAP_EMPLOYMENT_HISTORY;
GO

CREATE VIEW AAP_CERTIFICATEDETAILS_VIEW AS
SELECT * FROM AAP_CERTIFICATE_DETAILS;
GO

CREATE VIEW AAP_SHORTCOURSES_VIEW AS
SELECT * FROM AAP_SHORT_COURSES;
GO