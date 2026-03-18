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
        
        const result = await Student.deleteMany({ fullName: { $regex: /mathew\s+george/i } });
        console.log(`Successfully deleted ${result.deletedCount} student(s) matching "mathew george".`);
        
    } catch (e) {
        console.error("Error connecting or deleting:", e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

run();
