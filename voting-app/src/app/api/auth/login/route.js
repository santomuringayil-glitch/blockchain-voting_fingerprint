import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import Admin from "@/models/Admin";
import { signToken } from "@/lib/auth";
import { verifyPassword } from "@/lib/auth-node";

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();

        const { email, password, role } = body;

        if (!email || !password || !role) {
            return NextResponse.json(
                { error: "Email, password, and role are required" },
                { status: 400 }
            );
        }

        let user = null;
        let tokenPayload = {};

        if (role === "student") {
            user = await Student.findOne({ email });
            if (!user) {
                return NextResponse.json(
                    { error: "Invalid email or password" },
                    { status: 401 }
                );
            }
            const valid = await verifyPassword(password, user.passwordHash);
            if (!valid) {
                return NextResponse.json(
                    { error: "Invalid email or password" },
                    { status: 401 }
                );
            }
            tokenPayload = {
                userId: user._id.toString(),
                role: "student",
                walletAddress: user.walletAddress,
                studentId: user.studentId,
            };
        } else if (role === "admin") {
            user = await Admin.findOne({ email });
            if (!user) {
                return NextResponse.json(
                    { error: "Invalid email or password" },
                    { status: 401 }
                );
            }
            const valid = await verifyPassword(password, user.passwordHash);
            if (!valid) {
                return NextResponse.json(
                    { error: "Invalid email or password" },
                    { status: 401 }
                );
            }
            tokenPayload = {
                userId: user._id.toString(),
                role: "admin",
                username: user.username,
            };
        } else {
            return NextResponse.json(
                { error: "Invalid role. Must be 'student' or 'admin'" },
                { status: 400 }
            );
        }

        const token = signToken(tokenPayload);

        const response = NextResponse.json({
            message: "Login successful",
            role: tokenPayload.role,
            user: {
                id: user._id,
                email: user.email,
                role: tokenPayload.role,
                ...(role === "student"
                    ? { fullName: user.fullName, studentId: user.studentId }
                    : { username: user.username }),
            },
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 86400,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Login failed: " + error.message },
            { status: 500 }
        );
    }
}
