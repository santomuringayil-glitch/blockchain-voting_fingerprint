import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import { signToken } from "@/lib/auth";
import { hashPassword } from "@/lib/auth-node";

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();

        const { username, email, password } = body;

        // Validate required fields
        if (!username || !email || !password) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
            $or: [{ email }, { username }],
        });
        if (existingAdmin) {
            return NextResponse.json(
                { error: "Admin with this email or username already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create admin
        const admin = await Admin.create({
            username,
            email,
            passwordHash,
        });

        // Generate JWT
        const token = signToken({
            userId: admin._id.toString(),
            role: "admin",
            username: admin.username,
        });

        const response = NextResponse.json(
            { message: "Admin registration successful", role: "admin" },
            { status: 201 }
        );

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 86400,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Admin registration error:", error);
        return NextResponse.json(
            { error: "Registration failed: " + error.message },
            { status: 500 }
        );
    }
}
