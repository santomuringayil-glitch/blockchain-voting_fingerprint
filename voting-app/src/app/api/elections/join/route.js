import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Election from "@/models/Election";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== "student") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await dbConnect();
        const { electionCode } = await request.json();

        if (!electionCode) {
            return NextResponse.json(
                { error: "Election ID is required" },
                { status: 400 }
            );
        }

        const election = await Election.findOne({
            electionCode: electionCode.toUpperCase().trim(),
        });

        if (!election) {
            return NextResponse.json(
                { error: "Election not found. Please check the ID." },
                { status: 404 }
            );
        }

        // Return the election details so the frontend can redirect
        return NextResponse.json({
            message: "Election found",
            electionId: election._id,
            title: election.title,
            status: election.status
        });
    } catch (error) {
        console.error("Join election error:", error);
        return NextResponse.json(
            { error: "Failed to join election: " + error.message },
            { status: 500 }
        );
    }
}
