const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const MONGODB_URI = "mongodb://127.0.0.1:27017/voting-system";
const API_BASE = "http://127.0.0.1:3000";
const JWT_SECRET = "your-super-secret-jwt-key-change-this-in-production";

async function main() {
    console.log("=========================================");
    console.log("   🛡️  ADMIN PLATFORM FEATURES TEST  ");
    console.log("=========================================\n");

    await mongoose.connect(MONGODB_URI);
    console.log("[1] Connected to MongoDB");

    // 1. Setup Admin Token
    const AdminSchema = new mongoose.Schema({ username: String }, { strict: false });
    const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
    
    let admin = await Admin.findOne();
    if (!admin) {
        console.log("    -> No admin found! Creating a temporary test admin...");
         admin = await Admin.create({
            username: "testadmin",
            password: "hashedpassword123", // dummy
            email: "testadmin@test.com"
        });
    }

    const token = jwt.sign(
        { userId: admin._id.toString(), role: "admin" },
        JWT_SECRET,
        { expiresIn: "10m" }
    );
    console.log(`[2] Authenticated as Admin (JWT Generated)`);

    // 2. Test Admin Dashboard API
    console.log(`\n[3] Testing Dashboard Metrics API (/api/elections)`);
    try {
        const dashboardRes = await fetch(`${API_BASE}/api/elections`, {
            headers: { "Authorization": `Bearer ${token}`, "Cookie": `token=${token}` }
        });
        const dashboardData = await dashboardRes.json();
        
        if (dashboardRes.status === 200) {
            console.log(`    ✅ SUCCESS! Admin can successfully view elections.`);
            console.log(`    -> Total Elections Found: ${dashboardData.elections?.length || 0}`);
        } else {
            console.log("    ❌ Dashboard API Failed:", dashboardRes.status, dashboardData);
        }
    } catch(e) { console.log("    ❌ " + e.message); }

    // 3. Test Publishing Results (End the election and tally!)
    console.log(`\n[4] Testing Result Publishing API (/api/elections/:id/publish)`);
    
    const ElectionSchema = new mongoose.Schema({ electionCode: String, status: String }, { strict: false });
    const Election = mongoose.models.Election || mongoose.model("Election", ElectionSchema);
    
    // Check if ELECTION_123 is present
    const election = await Election.findOne({ electionCode: "ELECTION_123" });
    if (!election) { console.log("    ❌ Election not found"); process.exit(1); }

    // First, to publish results, the backend requires the election to be 'completed'.
    // Let's manually mark it completed just for the sake of triggering the publish endpoint.
    election.status = "completed";
    await election.save();

    console.log(`    -> Marked ELECTION_123 as 'completed'.`);
    console.log(`    -> Asking backend to verify blockchain and generate final tally...`);

    try {
        const publishRes = await fetch(`${API_BASE}/api/elections/${election._id.toString()}/publish`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Cookie": `token=${token}` }
        });
        
        const publishData = await publishRes.json();
        
        if (publishRes.status === 200) {
            console.log(`    ✅ SUCCESS! Blockchain Tally Successfully read and finalized!`);
            console.log("    -> Final Results Output:");
            console.table(publishData.results.candidates);
            console.log(`    🏆 Declared Winner: ${publishData.results.winner} (${publishData.results.totalVotes} Total Votes)`);
        } else {
            console.log("    ❌ Publish Results API Failed:", publishRes.status, publishData);
        }
    } catch(e) { console.log("    ❌ " + e.message); }

    console.log("\n=========================================");
    console.log("            SIMULATION COMPLETE            ");
    console.log("=========================================\n");
    process.exit(0);
}

main().catch(console.error);
