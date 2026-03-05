import mongoose from "mongoose";

const FingerprintSchema = new mongoose.Schema(
    {
        studentId: {
            type: String,
            required: true,
            unique: true,
        },
        fingerprintHash: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

FingerprintSchema.index({ studentId: 1 }, { unique: true });

export default mongoose.models.Fingerprint ||
    mongoose.model("Fingerprint", FingerprintSchema);
