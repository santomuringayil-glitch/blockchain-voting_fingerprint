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
        
        // Count all students in the system
        const studentCount = await Student.countDocuments({ role: "student" });
        
        // Count students who have voted at least once
        const votedCount = await Student.countDocuments({ role: "student", hasVotedAny: true });

        return NextResponse.json({
            studentCount,
            votedCount
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}
