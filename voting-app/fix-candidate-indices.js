const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://127.0.0.1:27017/voting-system";

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

    const election = await Election.findOne({ electionCode: "ELECTION_123" });

    // The current order on the smart contract (deployed 1 minute ago):
    // 1: Syem
    // 2: abi
    
    await Candidate.updateOne({ fullName: "Syem" }, { $set: { candidateIndex: 1 } });
    await Candidate.updateOne({ fullName: "abi" }, { $set: { candidateIndex: 2 } });

    console.log("Updated candidate indices in MongoDB successfully!");
    process.exit(0);
}

main().catch(console.error);
