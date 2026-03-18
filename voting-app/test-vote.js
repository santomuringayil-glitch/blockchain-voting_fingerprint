const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const MONGODB_URI = "mongodb://127.0.0.1:27017/voting-system";
const JWT_SECRET = "your-super-secret-jwt-key-change-this-in-production";

async function main() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB");

    const StudentSchema = new mongoose.Schema({
        studentId: String,
        walletIndex: Number
    }, { strict: false });
    const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);

    const ElectionSchema = new mongoose.Schema({
        electionCode: String,
        contractAddress: String,
        status: String
    }, { strict: false });
    const Election = mongoose.models.Election || mongoose.model("Election", ElectionSchema);

    const election = await Election.findOne({ status: "active" });
    if (!election) {
        console.log("No active election found!");
        process.exit(1);
    }

    const student = await Student.findOne().skip(1);
    if (!student) {
        console.log("No other student found to vote with!");
        process.exit(1);
    }
    console.log("Found student:", student.studentId);

    // Create a valid JWT token
    const token = jwt.sign(
        { userId: student._id.toString(), studentId: student.studentId, role: "student" },
        JWT_SECRET,
        { expiresIn: "10m" }
    );

    console.log("Simulating vote request...");

    const requestBody = {
        electionId: election._id.toString(),
        candidateIndex: 1,
        biometricToken: "test_token_from_scratchpad" // Dummy token for hardware check bypass if needed
    };

    try {
        const response = await fetch("http://127.0.0.1:3000/api/vote/cast", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "Cookie": `token=${token}`
            },
            body: JSON.stringify(requestBody)
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            console.log("\n--- Vote Request Complete ---");
            console.log("Status Code:", response.status);
            console.log("Response Body:", data);
            
            if (response.status === 200) {
                console.log("\n✅ SUCCESS! The vote went through the Next.js API perfectly.");
            } else {
                console.log("\n❌ API Returned an error. Please check the response body above.");
            }
        } else {
            const textData = await response.text();
            console.log("\n--- Vote Request Complete ---");
            console.log("Status Code:", response.status);
            console.log("Response Body (Not JSON):", textData.substring(0, 150) + "...");
             console.log("\n❌ Server returned an HTML/text error (likely Next.js throwing an unhandled error).");
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }

    process.exit(0);
}

main().catch(console.error);
