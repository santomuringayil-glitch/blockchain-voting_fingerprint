const mongoose = require('mongoose');

async function checkDb() {
    const uri = 'mongodb://127.0.0.1:27017/voting-system';
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB cluster.");
        
        const db = mongoose.connection.db;
        const collections = await db.collections();
        
        for (let collection of collections) {
            const count = await collection.countDocuments();
            console.log(`Collection '${collection.collectionName}': ${count} documents`);
        }
    } catch (error) {
        console.error("DB Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}
checkDb();
