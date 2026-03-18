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

    // Find elections with no contract address
    const elections = await Election.find({ 
        $or: [
            { contractAddress: "" },
            { contractAddress: null },
            { contractAddress: { $exists: false } }
        ]
    });

    if (elections.length === 0) {
        console.log("All elections already have contract addresses.");
        process.exit(0);
    }

    const provider = new ethers.JsonRpcProvider(GANACHE_URL);
    const accounts = await provider.listAccounts();
    const adminSigner = accounts[0];

    const artifactPath = path.join(process.cwd(), "artifacts", "contracts", "Voting.sol", "Voting.json");
    if(!fs.existsSync(artifactPath)) {
        console.log("Artifacts not compiled, you need to compile hardhat first!");
        process.exit(1);
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const bytecode = artifact.bytecode;

    for (let election of elections) {
        console.log(`Working on Election: ${election.electionCode}`);
        
        console.log("Deploying contract...");
        const factory = new ethers.ContractFactory(VotingABI, bytecode, adminSigner);
        const contract = await factory.deploy();
        await contract.waitForDeployment();
        const address = await contract.getAddress();
        
        console.log("Contract deployed at:", address);

        // Update election
        election.contractAddress = address;
        await election.save();
        console.log(`Election ${election.electionCode} updated successfully with contract ${address}.\n`);
    }

    console.log("All missing contracts deployed and linked!");
    process.exit(0);
}

main().catch(console.error);
