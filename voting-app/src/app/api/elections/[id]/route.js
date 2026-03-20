import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Election from "@/models/Election";
import Candidate from "@/models/Candidate";

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const election = await Election.findById(id);
        if (!election) {
            return NextResponse.json(
                { error: "Election not found" },
                { status: 404 }
            );
        }

        const candidates = await Candidate.find({ electionId: id });

        return NextResponse.json({ election, candidates });
    } catch (error) {
        console.error("Fetch election error:", error);
        return NextResponse.json(
            { error: "Failed to fetch election" },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const authModule = await import("@/lib/auth");
        const user = await authModule.getUserFromRequest(request);
        
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const election = await Election.findByIdAndDelete(id);
        if (!election) {
            return NextResponse.json(
                { error: "Election not found" },
                { status: 404 }
            );
        }

        // Also delete associated candidates
        await Candidate.deleteMany({ electionId: id });

        return NextResponse.json({ message: "Election deleted successfully" });
    } catch (error) {
        console.error("Delete election error:", error);
        return NextResponse.json(
            { error: "Failed to delete election" },
            { status: 500 }
        );
    }
}
