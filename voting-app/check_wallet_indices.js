const mongoose = require('mongoose');

async function checkStudents() {
    const MONGODB_URI = "mongodb://127.0.0.1:27017/voting-system";
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const students = await db.collection('students').find({}).toArray();

        console.log("Student Wallet Status:");
        students.forEach(s => {
            console.log(`- ${s.email}: Index=${s.walletIndex}, Address=${s.walletAddress || 'MISSING'}`);
        });
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
checkStudents();
