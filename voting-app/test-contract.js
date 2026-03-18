const mongoose = require('mongoose');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = "mongodb://127.0.0.1:27017/voting-system";
const GANACHE_URL = "http://127.0.0.1:7545";

const VotingABI = [
    "constructor()",
    "function admin() view returns (address)",
    "function electionActive() view returns (bool)",
    "function candidateCount() view returns (uint256)",
    "function candidates(uint256) view returns (uint256 id, string name, uint256 voteCount)",
    "function hasVoted(address) view returns (bool)",
    "function addCandidate(string memory _name)",
    "function startElection()",
    "function vote(uint256 _candidateId)",
    "function endElection()",
    "function getCandidate(uint256 _candidateId) view returns (uint256, string memory, uint256)",
    "function getCandidateCount() view returns (uint256)",
    "function getElectionStatus() view returns (bool)",
    "function checkHasVoted(address _voter) view returns (bool)",
];

async function main() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB");

    const ElectionSchema = new mongoose.Schema({
        electionCode: String,
        contractAddress: String,
        status: String
    }, { strict: false });
    const Election = mongoose.models.Election || mongoose.model("Election", ElectionSchema);
    const election = await Election.findOne({ electionCode: "ELECTION_123" });

    const StudentSchema = new mongoose.Schema({
        studentId: String,
        walletIndex: Number
    }, { strict: false });
    const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);
    const student = await Student.findOne({});

    console.log("Election contract:", election.contractAddress);
    console.log("Student wallet index:", student.walletIndex);

    const provider = new ethers.JsonRpcProvider(GANACHE_URL);
    const accounts = await provider.listAccounts();
    const studentSigner = accounts[student.walletIndex];

    console.log("Student Ganache Address:", studentSigner.address);

    const contractAdmin = new ethers.Contract(election.contractAddress, VotingABI, accounts[0]);
    const contractStudent = new ethers.Contract(election.contractAddress, VotingABI, studentSigner);

    // 1. Add candidates before voting if there are none.
    const candidateCount = await contractAdmin.getCandidateCount();
    console.log("Candidates count:", candidateCount.toString());
    
    if (candidateCount.toString() === "0") {
        console.log("Adding default test candidate...");
        let tx = await contractAdmin.addCandidate("Test Candidate A");
        await tx.wait();
        console.log("Candidate added!");
    }

    // 2. Ensure election is started
    const isActive = await contractAdmin.getElectionStatus();
    if (!isActive) {
        console.log("Starting election in contract...");
        let tx = await contractAdmin.startElection();
        await tx.wait();
        console.log("Election started!");
        election.status = "active";
        await election.save();
    }

    // 3. Try voting!
    console.log("\nSimulating student voting...");
    const hasVoted = await contractStudent.checkHasVoted(studentSigner.address);
    console.log("Has student already voted?", hasVoted);

    if (hasVoted) {
        console.log("This student has already voted. Verification was successful earlier.");
    } else {
        console.log("Casting vote...");
        let tx = await contractStudent.vote(1);
        await tx.wait();
        console.log("Vote successfully casted via smart contract! Tx Hash:", tx.hash);
    }

    process.exit(0);
}

main().catch(console.error);
