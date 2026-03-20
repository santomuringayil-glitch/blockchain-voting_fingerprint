import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Election from "@/models/Election";
import Student from "@/models/Student";
import { getUserFromRequest } from "@/lib/auth";
import { ethers } from "ethers";
import { getContract, getProvider } from "@/lib/contract";

export async function POST(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== "student") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await dbConnect();
        const body = await request.json();
        const { electionId, candidateIndex, biometricToken } = body;
        if (!electionId || candidateIndex === undefined || candidateIndex === null) {
            return NextResponse.json(
                { error: "Election ID and candidate index are required" },
                { status: 400 }
            );
        }

        // Biometric Security Layer
        const Fingerprint = require("@/models/Fingerprint").default;
        const fingerprintRecord = await Fingerprint.findOne({ studentId: user.studentId });

        if (fingerprintRecord) {
            if (!biometricToken) {
                return NextResponse.json(
                    { error: "Biometric authentication required. Please scan your fingerprint to vote." },
                    { status: 403 }
                );
            }
            console.log(`DEBUG: Biometric token received for ${user.studentId}`);
        } else {
            console.log(`DEBUG: No biometric data found for ${user.studentId}. Skipping strict hardware enforcement.`);
        }

        const election = await Election.findById(electionId);
        if (!election) {
            return NextResponse.json(
                { error: "Election not found" },
                { status: 404 }
            );
        }

        console.log(`DEBUG: Casting vote for Election: ${election.title} (${electionId})`);
        console.log(`DEBUG: Candidate Index: ${candidateIndex}`);

        if (election.status !== "active") {
            return NextResponse.json(
                { error: "Election is not currently active" },
                { status: 400 }
            );
        }

        // Get student wallet
        const student = await Student.findById(user.userId);
        if (!student) {
            return NextResponse.json(
                { error: "Student not found" },
                { status: 404 }
            );
        }

        console.log(`DEBUG: Student Wallet Index: ${student.walletIndex}`);

        // Cast vote via smart contract
        try {
            if (election.contractAddress) {
                const provider = getProvider();
                const accounts = await provider.listAccounts();

                if (student.walletIndex >= accounts.length) {
                    return NextResponse.json(
                        { error: "No wallet assigned locally (Ganache account limit reached). Please increase Ganache 'Total Accounts' setting." },
                        { status: 400 }
                    );
                }

                const studentSigner = accounts[student.walletIndex];
                console.log(`DEBUG: Student Wallet Address: ${studentSigner.address}`);

                const balance = await provider.getBalance(studentSigner.address);
                console.log(`DEBUG: Student Balance: ${ethers.formatEther(balance)} ETH`);

                const contract = getContract(election.contractAddress, studentSigner);

                // Check if already voted
                console.log("DEBUG: Checking if already voted...");
                const alreadyVoted = await contract.checkHasVoted(studentSigner.address);
                console.log(`DEBUG: Has Voted: ${alreadyVoted}`);

                if (alreadyVoted) {
                    return NextResponse.json(
                        { error: "You have already voted in this election" },
                        { status: 400 }
                    );
                }

                console.log("DEBUG: Sending vote transaction...");
                const tx = await contract.vote(candidateIndex);
                console.log(`DEBUG: Transaction Hash: ${tx.hash}`);
                const receipt = await tx.wait();
                console.log(`DEBUG: Transaction Success! Block: ${receipt.blockNumber}`);

                // Record off-chain that the student has voted at least once
                student.hasVotedAny = true;
                await student.save();

                election.totalVotes = (election.totalVotes || 0) + 1;
                await election.save();

                return NextResponse.json({
                    message: "Vote cast successfully!",
                    transactionHash: receipt.hash,
                });
            } else {
                return NextResponse.json(
                    { error: "No smart contract deployed for this election" },
                    { status: 400 }
                );
            }
        } catch (e) {
            if (e.message.includes("already voted")) {
                return NextResponse.json(
                    { error: "You have already voted in this election" },
                    { status: 400 }
                );
            }
            throw e;
        }
    } catch (error) {
        console.error("Cast vote error:", error);
        return NextResponse.json(
            { error: "Failed to cast vote: " + error.message },
            { status: 500 }
        );
    }
}
