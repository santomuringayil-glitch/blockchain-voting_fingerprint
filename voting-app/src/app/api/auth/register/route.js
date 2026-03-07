import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import Fingerprint from "@/models/Fingerprint";
import { signToken } from "@/lib/auth";
import { hashPassword } from "@/lib/auth-node";
import { hashFingerprint } from "@/lib/fingerprint";
import { getProvider } from "@/lib/contract";

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();

        const { fullName, email, studentId, department, year, password } = body;

        // Validate required fields
        if (!fullName || !email || !studentId || !department || !year || !password) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // Check if student already exists
        const existingStudent = await Student.findOne({
            $or: [{ email }, { studentId }],
        });
        if (existingStudent) {
            return NextResponse.json(
                { error: "Student with this email or ID already exists" },
                { status: 409 }
            );
        }

        // Check if device is already registered to another student (Option 1 - Strict Security)
        if (body.deviceId) {
            const existingDeviceUser = await Fingerprint.findOne({ fingerprintHash: `bio-${body.deviceId}` });
            if (existingDeviceUser) {
                return NextResponse.json(
                    { error: "Device already registered to another student. One account per device." },
                    { status: 409 }
                );
            }
        }

        // Hash password with bcrypt
        const passwordHash = await hashPassword(password);

        // Get next available wallet from Ganache
        const studentCount = await Student.countDocuments();
        const walletIndex = studentCount + 1; // index 0 = admin

        let walletAddress = "";
        try {
            const provider = getProvider();
            const accounts = await provider.listAccounts();
            if (walletIndex < accounts.length) {
                walletAddress = accounts[walletIndex].address;
            }
        } catch (e) {
            console.warn("Ganache not available, wallet assignment skipped:", e.message);
        }

        // Create student
        const student = await Student.create({
            fullName,
            email,
            studentId,
            department,
            year: parseInt(year),
            passwordHash,
            walletAddress,
            walletIndex,
        });


        // Generate JWT
        const token = signToken({
            userId: student._id.toString(),
            role: "student",
            walletAddress,
            studentId: student.studentId,
        });

        const response = NextResponse.json(
            { message: "Registration successful", role: "student" },
            { status: 201 }
        );

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 86400, // 24 hours
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Registration failed: " + error.message },
            { status: 500 }
        );
    }
}
