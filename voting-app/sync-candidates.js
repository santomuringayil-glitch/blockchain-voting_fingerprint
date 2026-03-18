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

    const CandidateSchema = new mongoose.Schema({
        fullName: String,
        electionId: mongoose.Schema.Types.ObjectId,
        candidateIndex: Number
    }, { strict: false });
    const Candidate = mongoose.models.Candidate || mongoose.model("Candidate", CandidateSchema);

    const election = await Election.findOne({ status: "active" });
    if (!election) {
        console.log("No active election found!");
        process.exit(1);
    }

    const candidates = await Candidate.find({ electionId: election._id }).sort({ candidateIndex: 1 });
    console.log(`Found ${candidates.length} candidates in DB for ${election.electionCode}:`, candidates.map(c => `${c.fullName} (Index: ${c.candidateIndex})`).join(", "));

    // 1. Deploy fresh contract
    const provider = new ethers.JsonRpcProvider(GANACHE_URL);
    const accounts = await provider.listAccounts();
    const adminSigner = accounts[0];

    const artifactPath = path.join(process.cwd(), "artifacts", "contracts", "Voting.sol", "Voting.json");
    if(!fs.existsSync(artifactPath)) {
        console.log("Artifacts missing!"); process.exit(1);
    }
    const bytecode = JSON.parse(fs.readFileSync(artifactPath, "utf8")).bytecode;

    console.log("Deploying fresh contract...");
    const factory = new ethers.ContractFactory(VotingABI, bytecode, adminSigner);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    console.log("New Contract Address:", address);

    // 2. Add candidates in order
    for (const c of candidates) {
        console.log(`Adding candidate to blockchain: ${c.fullName}...`);
        const tx = await contract.addCandidate(c.fullName);
        await tx.wait();
        console.log(`Added!`);
    }

    // 3. Start election if active
    console.log("Starting election on blockchain...");
    const txStart = await contract.startElection();
    await txStart.wait();

    // 4. Update election
    election.contractAddress = address;
    election.status = "active";
    await election.save();

    console.log("\nSuccessfully synced DB candidates to the blockchain!");
    process.exit(0);
}

main().catch(console.error);
