const mongoose = require('mongoose');

async function wipeDatabase() {
    console.log("Starting database cleanup...");
    
    // Connect to MongoDB
    const uri = 'mongodb://127.0.0.1:27017/voting-system';
    if (!uri) {
        console.error("ERROR: MONGODB_URI not found in .env.local");
        process.exit(1);
    }
    
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB cluster.");
        
        const db = mongoose.connection.db;
        
        // Let's get all collections
        const collections = await db.collections();
        
        if (collections.length === 0) {
            console.log("Database is already empty.");
        } else {
            for (let collection of collections) {
                const collName = collection.collectionName;
                console.log(`Deleting all documents from collection: ${collName}...`);
                await collection.deleteMany({});
            }
            console.log("\n✅ Database wiped successfully!");
            console.log("All Students, Admins, Elections, and Fingerprints have been deleted.");
        }
        
    } catch (error) {
        console.error("Error during database wipe:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
        process.exit(0);
    }
}

wipeDatabase();
