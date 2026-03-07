const nodemailer = require('nodemailer');

async function testEmail() {
    console.log("Testing email with settings:");
    console.log("Host:", process.env.EMAIL_HOST);
    console.log("Port:", process.env.EMAIL_PORT);
    console.log("User:", process.env.EMAIL_USER);
    console.log("Pass:", process.env.EMAIL_PASS ? "****" + process.env.EMAIL_PASS.slice(-4) : "MISSING");

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        console.log("\nVerifying connection...");
        await transporter.verify();
        console.log("✅ Server is ready to take our messages");
        
        console.log("Attempting to send a test email...");
        const info = await transporter.sendMail({
            from: '"BlockVote Test" <' + process.env.EMAIL_USER + '>',
            to: process.env.EMAIL_USER,
            subject: "Test Email from BlockVote",
            text: "If you get this, Nodemailer is working perfectly!",
        });
        
        console.log("✅ Message sent: %s", info.messageId);
    } catch (error) {
        console.error("❌ Error sending email:");
        console.error(error);
    }
}

testEmail();
