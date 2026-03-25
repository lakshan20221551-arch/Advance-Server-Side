const cron = require('node-cron');
const { sql, poolPromise } = require('../config/db');
const nodemailer = require('nodemailer');

// Configure your email transporter
const transporter = nodemailer.createTransport({
    // You'll need to provide actual SMTP settings here
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function runDailyWinnerSelection() {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate()); // For the current date selection logic
        const targetDate = yesterday.toISOString().split('T')[0];

        const pool = await poolPromise;
        const result = await pool.request()
            .input("DateToSelect", sql.Date, targetDate)
            .execute("SelectDailyWinner");

        if (result.recordset && result.recordset.length > 0) {
            const winner = result.recordset[0];
            console.log(`Congratulations to winner: ${winner.auv_email}`);

            // Send Email
            const mailOptions = {
                from: process.env.EMAIL_USER,
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

// Scheduled Task at 12:00 AM every day
cron.schedule('0 0 * * *', () => {
    console.log('Running daily winner selection...');
    runDailyWinnerSelection();
});

module.exports = { runDailyWinnerSelection };
