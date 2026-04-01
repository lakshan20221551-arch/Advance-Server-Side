const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                 user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASS , 
            },
        });

        const mailOptions = {
            from: `Alumni Influencers <${process.env.EMAIL_ADDRESS}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email Sent Successfully: " + info.messageId);
    } catch(err) {
        console.error("Email setup failed (You need to configure EMAIL_ADDRESS and EMAIL_PASS in .env):", err.message);
    }
};

module.exports = sendEmail;
