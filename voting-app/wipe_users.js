const mongoose = require('mongoose');

async function wipeUsersOnly() {
    console.log("Starting user-only database cleanup...");
    console.log("⚠️  This will ONLY delete Students, Admins, and Fingerprints.");
    console.log("   Elections and Candidates will NOT be touched.\n");
    
    const uri = 'mongodb://127.0.0.1:27017/voting-system';
    
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB.\n");
        
        const db = mongoose.connection.db;
        
        // Only target user-related collections
        const userCollections = ['students', 'admins', 'fingerprints'];
        
        for (let collName of userCollections) {
            try {
                const collection = db.collection(collName);
                const count = await collection.countDocuments();
                if (count > 0) {
                    await collection.deleteMany({});
                    console.log(`✅ Deleted ${count} documents from "${collName}"`);
                } else {
                    console.log(`⏭️  "${collName}" is already empty`);
                }
            } catch (err) {
                console.log(`⏭️  "${collName}" collection not found, skipping`);
            }
        }
        
        console.log("\n✅ User data wiped successfully!");
        console.log("   Elections and Candidates remain untouched.");
        
    } catch (error) {
        console.error("Error during wipe:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
        process.exit(0);
    }
}

wipeUsersOnly();
