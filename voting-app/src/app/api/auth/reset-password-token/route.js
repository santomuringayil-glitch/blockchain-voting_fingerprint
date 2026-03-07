import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import jwt from "jsonwebtoken";
import { hashPassword } from "@/lib/auth-node";

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { token, newPassword } = body;

        if (!token || !newPassword) {
            return NextResponse.json(
                { error: "Token and new password are required" },
                { status: 400 }
            );
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET is not configured");

        // 1. Verify the exact validity of the JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return NextResponse.json(
                    { error: "This password reset link has expired. Please request a new one." },
                    { status: 401 }
                );
            }
            return NextResponse.json(
                { error: "Invalid or malformed reset token. Please request a new one." },
                { status: 401 }
            );
        }

        // 2. Find the student using the ID baked into the secure token
        const student = await Student.findOne({ studentId: decoded.studentId });

        if (!student) {
            return NextResponse.json(
                { error: "Student account no longer exists." },
                { status: 404 }
            );
        }

        // 3. Hash the new password and save it
        const passwordHash = await hashPassword(newPassword);
        student.passwordHash = passwordHash;
        await student.save();

        return NextResponse.json(
            { message: "Password updated successfully via email verification" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Token reset error:", error);
        return NextResponse.json(
            { error: "Failed to reset password: " + error.message },
            { status: 500 }
        );
    }
}
