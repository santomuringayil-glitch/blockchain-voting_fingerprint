import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import Fingerprint from "@/models/Fingerprint";
import { hashPassword } from "@/lib/auth-node";

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { identifier, newPassword, deviceId } = body;

        if (!identifier || !newPassword || !deviceId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // 1. Find the student
        const student = await Student.findOne({
            $or: [{ email: identifier }, { studentId: identifier }],
        });

        if (!student) {
            return NextResponse.json(
                { error: "Student not found" },
                { status: 404 }
            );
        }

        // 2. Fetch the student's registered fingerprint/device
        const fingerprintRecord = await Fingerprint.findOne({ studentId: student.studentId });

        if (!fingerprintRecord) {
            return NextResponse.json(
                { error: "No biometric data registered for this student" },
                { status: 403 }
            );
        }

        // 3. Verify the device ID matches
        if (fingerprintRecord.fingerprintHash !== deviceId) {
            return NextResponse.json(
                { error: "Verification Failed. This device does not match the one used during registration." },
                { status: 403 }
            );
        }

        // 4. Update the password
        const passwordHash = await hashPassword(newPassword);
        student.passwordHash = passwordHash;
        await student.save();

        return NextResponse.json(
            { message: "Password updated successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Password reset error:", error);
        return NextResponse.json(
            { error: "Failed to reset password: " + error.message },
            { status: 500 }
        );
    }
}
