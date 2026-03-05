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
