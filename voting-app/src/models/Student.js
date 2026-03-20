import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        studentId: {
            type: String,
            required: [true, "Student ID is required"],
            unique: true,
            trim: true,
        },
        department: {
            type: String,
            required: [true, "Department is required"],
            trim: true,
        },
        year: {
            type: Number,
            required: [true, "Year is required"],
            min: 1,
            max: 5,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        walletAddress: {
            type: String,
            default: "",
        },
        walletIndex: {
            type: Number,
            default: -1,
        },
        role: {
            type: String,
            default: "student",
        },
        hasVotedAny: {
            type: Boolean,
            default: false,
        },
        isApproved: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Student ||
    mongoose.model("Student", StudentSchema);
