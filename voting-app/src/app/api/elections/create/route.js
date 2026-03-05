import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Election from "@/models/Election";
import { getUserFromRequest } from "@/lib/auth";
import { deployVotingContract } from "@/lib/contract";

export async function POST(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await dbConnect();
        const body = await request.json();
        const { title, description, startDate, endDate } = body;

        if (!title || !startDate || !endDate) {
            return NextResponse.json(
                { error: "Title, start date, and end date are required" },
                { status: 400 }
            );
        }

        // Deploy a new Voting contract
        let contractAddress = "";
        try {
            contractAddress = await deployVotingContract();
        } catch (e) {
            console.warn("Contract deployment failed (Ganache may not be running):", e.message);
        }

        // Generate a unique election code (e.g., ELECTION-20231001-0001)
        const generateElectionCode = async (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            const dateStr = `${year}${month}${day}`;

            // Find elections starting on the same day
            const startOfDay = new Date(d.setHours(0, 0, 0, 0));
            const endOfDay = new Date(d.setHours(23, 59, 59, 999));

            const count = await Election.countDocuments({
                startDate: { $gte: startOfDay, $lte: endOfDay }
            });

            const sequentialNum = String(count + 1).padStart(4, "0");
            return `ELECTION-${dateStr}-${sequentialNum}`;
        };

        const electionCode = await generateElectionCode(startDate);

        const election = await Election.create({
            title,
            description: description || "",
            electionCode,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            contractAddress,
            createdBy: user.userId,
            status: "upcoming",
        });

        return NextResponse.json(
            { message: "Election created successfully", election },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create election error:", error);
        return NextResponse.json(
            { error: "Failed to create election: " + error.message },
            { status: 500 }
        );
    }
}
