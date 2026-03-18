const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        studentId: String,
        department: String,
        year: Number,
        passwordHash: String,
        walletAddress: String,
        walletIndex: Number,
        role: String,
        isApproved: Boolean,
    },
    { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);

const run = async () => {
    try {
        const uri = "mongodb://127.0.0.1:27017/voting-system";
        await mongoose.connect(uri);
        console.log("Connected to MongoDB.");
        
        // Find ALL students to see what's actually in there
        const students = await Student.find({}, 'fullName email studentId');
        console.log("Current Students in DB:");
        console.dir(students);
        
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

run();
