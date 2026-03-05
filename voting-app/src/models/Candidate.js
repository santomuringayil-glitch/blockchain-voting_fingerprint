import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Candidate name is required"],
            trim: true,
        },
        party: {
            type: String,
            default: "Independent",
            trim: true,
        },
        department: {
            type: String,
            default: "",
            trim: true,
        },
        electionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Election",
            required: true,
        },
        manifesto: {
            type: String,
            default: "",
            maxlength: 500,
        },
        candidateIndex: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

CandidateSchema.index({ electionId: 1 });

export default mongoose.models.Candidate ||
    mongoose.model("Candidate", CandidateSchema);
