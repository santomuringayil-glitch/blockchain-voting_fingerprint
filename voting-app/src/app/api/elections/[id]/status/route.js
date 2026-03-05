import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Election from "@/models/Election";
import { getUserFromRequest } from "@/lib/auth";
import { getContract, getProvider } from "@/lib/contract";

export async function PATCH(request, { params }) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const { action } = body; // "start" or "end"

        const election = await Election.findById(id);
        if (!election) {
            return NextResponse.json(
                { error: "Election not found" },
                { status: 404 }
            );
        }

        // Update smart contract status
        try {
            if (election.contractAddress) {
                const provider = getProvider();
                const accounts = await provider.listAccounts();
                const adminSigner = accounts[0];
                const contract = getContract(election.contractAddress, adminSigner);

                if (action === "start") {
                    const tx = await contract.startElection();
                    await tx.wait();
                } else if (action === "end") {
                    const tx = await contract.endElection();
                    await tx.wait();
                }
            }
        } catch (e) {
            console.warn("Smart contract status update failed:", e.message);
        }

        // Update MongoDB status
        if (action === "start") {
            election.status = "active";
        } else if (action === "end") {
            election.status = "completed";
        } else {
            return NextResponse.json(
                { error: "Invalid action. Use 'start' or 'end'" },
                { status: 400 }
            );
        }

        await election.save();

        return NextResponse.json({
            message: `Election ${action}ed successfully`,
            election,
        });
    } catch (error) {
        console.error("Update election status error:", error);
        return NextResponse.json(
            { error: "Failed to update status: " + error.message },
            { status: 500 }
        );
    }
}
