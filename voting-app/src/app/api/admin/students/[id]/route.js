import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import { getUserFromRequest } from "@/lib/auth";

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await getUserFromRequest(request);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const student = await Student.findByIdAndDelete(id);
        if (!student) {
            return NextResponse.json(
                { error: "Student not found" },
                { status: 404 }
            );
        }

        // We could also delete Fingerprint records, Votes (if any off-chain records existed besides hasVotedAny), etc.
        const Fingerprint = require("@/models/Fingerprint").default;
        await Fingerprint.deleteOne({ studentId: student.studentId });

        return NextResponse.json({ message: "Student deleted successfully" });
    } catch (error) {
        console.error("Delete student error:", error);
        return NextResponse.json(
            { error: "Failed to delete student" },
            { status: 500 }
        );
    }
}
