import mongoose from "mongoose";

const ElectionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Election title is required"],
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        electionCode: {
            type: String,
            required: [true, "Election ID is required"],
            unique: true,
            trim: true,
        },
        contractAddress: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["upcoming", "active", "completed", "results_published"],
            default: "upcoming",
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },
        results: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Election ||
    mongoose.model("Election", ElectionSchema);
