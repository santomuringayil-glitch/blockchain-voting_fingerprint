const mongoose = require("mongoose");

const FingerprintSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "userModel",
        },
        userModel: {
            type: String,
            required: true,
            enum: ["Student", "Admin"],
        },
        fingerprintHash: {
            type: String,
            required: true,
            unique: true,
        },
    },
    { timestamps: true }
);

const Fingerprint = mongoose.models.Fingerprint || mongoose.model("Fingerprint", FingerprintSchema);

const run = async () => {
    try {
        const uri = "mongodb://127.0.0.1:27017/voting-system";
        await mongoose.connect(uri);
        console.log("Connected to MongoDB.");
        
        const count = await Fingerprint.countDocuments();
        console.log(`There are currently ${count} registered devices (fingerprints) in the DB.`);
        
        // Let's wipe them out so the device is free to register again
        if (count > 0) {
            const result = await Fingerprint.deleteMany({});
            console.log(`Wiped ${result.deletedCount} old device registrations!`);
        }
        
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

run();
