import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await dbConnect();
        
        // Fetch all students (excluding passwords/sensitive info ideally, but handled mostly by generic finds, we can select specific fields)
        const students = await Student.find({ role: "student" })
            .select("-passwordHash")
            .sort({ createdAt: -1 });

        return NextResponse.json({ students });
    } catch (error) {
        console.error("Fetch students error:", error);
        return NextResponse.json(
            { error: "Failed to fetch students" },
            { status: 500 }
        );
    }
}
