const mongoose = require('mongoose');
const { ethers } = require('ethers');

const MONGODB_URI = "mongodb://127.0.0.1:27017/voting-system";
const GANACHE_URL = "http://127.0.0.1:7545";
const DUMMY_FINGERPRINT = "test_fingerprint_data_12345";

const VotingABI = [
    "function getCandidate(uint256 _candidateId) view returns (uint256, string memory, uint256)",
    "function vote(uint256 _candidateId)"
];

async function main() {
    console.log("=========================================");
    console.log("   🗳️  END-TO-END VOTING SIMULATION   ");
    console.log("=========================================\n");

    await mongoose.connect(MONGODB_URI);
    console.log("[1] Connected to MongoDB");

    const StudentSchema = new mongoose.Schema({ studentId: String, walletIndex: Number }, { strict: false });
    const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);

    const ElectionSchema = new mongoose.Schema({ electionCode: String, contractAddress: String, status: String }, { strict: false });
    const Election = mongoose.models.Election || mongoose.model("Election", ElectionSchema);

    const FingerprintSchema = new mongoose.Schema({ studentId: String, fingerprintHash: String }, { strict: false });
    const Fingerprint = mongoose.models.Fingerprint || mongoose.model("Fingerprint", FingerprintSchema);

    // 1. Setup Student
    const student = await Student.findOne();
    if (!student) { console.log("❌ No students in DB"); process.exit(1); }
    
    // Assign fresh wallet to avoid "already voted" revert on contract
    student.walletIndex = Math.floor(Math.random() * 5) + 4; 
    await student.save();
    console.log(`[2] Simulating user session for Student: ${student.studentId} (Wallet Index: ${student.walletIndex})`);

    const provider = new ethers.JsonRpcProvider(GANACHE_URL);
    const accounts = await provider.listAccounts();
    const adminSigner = accounts[0];
    const studentSigner = accounts[student.walletIndex];

    const balance = await provider.getBalance(studentSigner.address);
    if (balance < ethers.parseEther("0.1")) {
        console.log(`    -> Funding student wallet for gas fees...`);
        const tx = await adminSigner.sendTransaction({ to: studentSigner.address, value: ethers.parseEther("0.5") });
        await tx.wait();
    }

    // 2. Register Fingerprint
    console.log(`\n[3] User scans fingerprint on their phone...`);
    console.log(`    -> Fingerprint captured: "${DUMMY_FINGERPRINT}"`);
    console.log(`    -> Saving fingerprint to Database...`);
    
    await Fingerprint.deleteMany({});
    await Fingerprint.create({ studentId: student.studentId, fingerprintHash: DUMMY_FINGERPRINT });
    console.log(`    ✅ Fingerprint successfully registered!`);

    // 3. Setup Election
    const election = await Election.findOne({ electionCode: "ELECTION_123" });
    if (!election) { console.log("❌ Election not found"); process.exit(1); }
    if (election.status !== "active") {
        election.status = "active";
        await election.save();
    }

    const candidateIndexToVoteFor = 1; // "Syem"
    const contractAdmin = new ethers.Contract(election.contractAddress, [
        "function addCandidate(string memory _name)",
        "function getCandidateCount() view returns (uint256)",
        "function getCandidate(uint256 _candidateId) view returns (uint256, string memory, uint256)"
    ], adminSigner);

    let count = await contractAdmin.getCandidateCount();
    if (count.toString() === "0") {
        console.log(`    -> No candidates found on blockchain. Adding "Syem" (Index 1)...`);
        const addTx = await contractAdmin.addCandidate("Syem");
        await addTx.wait();
        console.log(`    -> Candidate added!`);
    }

    // 4. Cast Vote
    console.log(`\n[5] APP PROMPT: "Please scan fingerprint to confirm vote"`);
    console.log(`    -> User scans fingerprint again...`);
    
    const fpCheck = await Fingerprint.findOne({ studentId: student.studentId, fingerprintHash: DUMMY_FINGERPRINT });
    if (!fpCheck) {
        console.log("❌ Biometric verification failed."); process.exit(1);
    }
    console.log(`    ✅ Fingerprint matched! Sending vote to Blockchain...`);

    const contractStudent = new ethers.Contract(election.contractAddress, VotingABI, studentSigner);
    
    try {
        const voteTx = await contractStudent.vote(candidateIndexToVoteFor);
        const receipt = await voteTx.wait();
        
        console.log(`\n🎉 SUCCESS! Vote Accepted by Smart Contract.`);
        console.log(`    -> Transaction Hash: ${receipt.hash}`);
        
        // Verify output
        console.log(`\n[6] Verifying vote on the Blockchain:`);
        const contractAdmin = new ethers.Contract(election.contractAddress, VotingABI, adminSigner);
        const [, name, voteCount] = await contractAdmin.getCandidate(candidateIndexToVoteFor);
        console.log(`    -> Blockchain confirmed Candidate "${name}" now has ${voteCount.toString()} votes!`);
        
    } catch (e) {
        console.log(`\n❌ VOTE FAILED on Blockchain:`, e.reason || e.message);
    }
    
    console.log("\n=========================================");
    console.log("            SIMULATION COMPLETE            ");
    console.log("=========================================\n");
    process.exit(0);
}

main().catch(console.error);
