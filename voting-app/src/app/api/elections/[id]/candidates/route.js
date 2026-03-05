import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Election from "@/models/Election";
import Candidate from "@/models/Candidate";
import { getUserFromRequest } from "@/lib/auth";
import { getContract, getProvider } from "@/lib/contract";

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const candidates = await Candidate.find({ electionId: id });
        return NextResponse.json({ candidates });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch candidates" },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const { fullName, party, department, manifesto } = body;

        if (!fullName) {
            return NextResponse.json(
                { error: "Candidate name is required" },
                { status: 400 }
            );
        }

        const election = await Election.findById(id);
        if (!election) {
            return NextResponse.json(
                { error: "Election not found" },
                { status: 404 }
            );
        }

        if (election.status !== "upcoming") {
            return NextResponse.json(
                { error: "Can only add candidates to upcoming elections" },
                { status: 400 }
            );
        }

        // Add candidate to smart contract
        let candidateIndex = 0;
        try {
            if (election.contractAddress) {
                const provider = getProvider();
                const accounts = await provider.listAccounts();
                const adminSigner = accounts[0];
                const contract = getContract(election.contractAddress, adminSigner);
                const tx = await contract.addCandidate(fullName);
                await tx.wait();
                const count = await contract.getCandidateCount();
                candidateIndex = Number(count);
            }
        } catch (e) {
            console.warn("Smart contract interaction failed:", e.message);
            // Fallback: use DB count
            const existingCount = await Candidate.countDocuments({ electionId: id });
            candidateIndex = existingCount + 1;
        }

        const candidate = await Candidate.create({
            fullName,
            party: party || "Independent",
            department: department || "",
            manifesto: manifesto || "",
            electionId: id,
            candidateIndex,
        });

        return NextResponse.json(
            { message: "Candidate added successfully", candidate },
            { status: 201 }
        );
    } catch (error) {
        console.error("Add candidate error:", error);
        return NextResponse.json(
            { error: "Failed to add candidate: " + error.message },
            { status: 500 }
        );
    }
}
