const cron = require('node-cron');
const { sql, poolPromise } = require('../config/db');
const nodemailer = require('nodemailer');

// Configure your email transporter
const transporter = nodemailer.createTransport({
    // You'll need to provide actual SMTP settings here
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASS
    }
});

async function runSixPMWinnerSelection() {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const targetDate = tomorrow.toISOString().split('T')[0];

        const pool = await poolPromise;
        const result = await pool.request()
            .input("DateToSelect", sql.Date, targetDate)
            .execute("SelectDailyWinner");

        if (result.recordset && result.recordset.length > 0) {
            const winner = result.recordset[0];
            console.log(`Congratulations to winner: ${winner.auv_email}`);

            // Send Email
            const mailOptions = {
                from: process.env.EMAIL_ADDRESS,
                to: winner.auv_email,
                subject: 'Congratulations! You are the Alumni of the Day',
                text: `Hello! You have won the bidding for ${targetDate} with an amount of ${winner.Amount}. You are now featured as our Alumni of the Day.`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error sending email:', error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    } catch (err) {
        console.error('CRON Winner Selection Error:', err);
    }
}

async function runMidnightActivation() {
    try {
        const today = new Date();
        const targetDate = today.toISOString().split('T')[0];

        const pool = await poolPromise;
        // Activate today's winning profile
        await pool.request()
            .input("TargetDate", sql.Date, targetDate)
            .query("UPDATE AAP_ALUMNIOFTHE_DAY SET adw_status = 'Active' WHERE adw_selection_date = @TargetDate AND adw_status = 'Pending_Activation'");

        // Deactivate yesterday's profiles
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yDate = yesterday.toISOString().split('T')[0];
        await pool.request()
            .input("YDate", sql.Date, yDate)
            .query("UPDATE AAP_ALUMNIOFTHE_DAY SET adw_status = 'Completed' WHERE adw_selection_date = @YDate AND adw_status = 'Active'");

        console.log(`Activated winner for ${targetDate}`);
    } catch (err) {
        console.error('CRON Midnight Activation Error:', err);
    }
}

// Scheduled Task at 6:00 PM every day for selecting tomorrow's winner
cron.schedule('0 18 * * *', () => {
    console.log('Running 6 PM winner selection...');
    runSixPMWinnerSelection();
});

// Scheduled Task at 12:00 AM every day for activating the winner
cron.schedule('0 0 * * *', () => {
    console.log('Running midnight winner activation...');
    runMidnightActivation();
});

module.exports = { runSixPMWinnerSelection, runMidnightActivation };
