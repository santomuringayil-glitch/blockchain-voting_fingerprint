const mongoose = require('mongoose');
const { ethers } = require('ethers');

async function syncWallets() {
    const GANACHE_URL = "http://127.0.0.1:7545";
    const MONGODB_URI = "mongodb://127.0.0.1:27017/voting-system";

    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        const provider = new ethers.JsonRpcProvider(GANACHE_URL);
        const accounts = await provider.listAccounts();
        console.log(`Ganache accounts available: ${accounts.length}`);

        const students = await db.collection('students').find({}).toArray();
        console.log(`Students in DB: ${students.length}`);

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const newIndex = i + 1; // Index 0 is admin

            let newAddress = "";
            if (newIndex < accounts.length) {
                newAddress = accounts[newIndex].address;
            } else {
                console.warn(`⚠️ Warning: No account available for student ${student.email} (Index ${newIndex})`);
                // We still assign the index, but warn the user to increase Ganache limit
            }

            await db.collection('students').updateOne(
                { _id: student._id },
                { $set: { walletIndex: newIndex, walletAddress: newAddress } }
            );
            console.log(`Synced ${student.email} -> Index ${newIndex}, Address: ${newAddress || 'PENDING (Increase Ganache Limit)'}`);
        }

        console.log("\n✅ Synchronization complete.");
        if (students.length >= accounts.length) {
            console.log("\n🚨 IMPORTANT: You have more students than Ganache accounts!");
            console.log(`Students: ${students.length}, Ganache Accounts: ${accounts.length}`);
            console.log("Please increase 'Total Accounts to Generate' in Ganache Settings -> Server to at least 20.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Sync failed:", error);
        process.exit(1);
    }
}

syncWallets();
