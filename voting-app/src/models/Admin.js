import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: "admin",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
