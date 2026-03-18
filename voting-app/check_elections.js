const mongoose = require("mongoose");

async function checkElections() {
    console.log("Checking Elections...");
    
    // Connect to MongoDB
    const uri = 'mongodb://127.0.0.1:27017/voting-system';

    try {
        await mongoose.connect(uri);
        const db = mongoose.connection.db;
        const elections = await db.collection("elections").find({}).toArray();
        for (const e of elections) {
            console.log(`Election Code: ${e.electionCode}, Contract Address: ${e.contractAddress}, Status: ${e.status}`);
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkElections();
