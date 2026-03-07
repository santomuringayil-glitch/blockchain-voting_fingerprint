import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Fingerprint from "@/models/Fingerprint";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== "student") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await dbConnect();
        const body = await request.json();
        const { biometricToken } = body;

        if (!biometricToken) {
            return NextResponse.json(
                { error: "Biometric token is required" },
                { status: 400 }
            );
        }

        // Security Enforcement: Prevent same fingerprint/device from being used by different students
        const existingDeviceUser = await Fingerprint.findOne({ fingerprintHash: biometricToken });
        
        if (existingDeviceUser && existingDeviceUser.studentId !== user.studentId) {
            return NextResponse.json(
                { error: "Person with this fingerprint already exists" },
                { status: 409 }
            );
        }

        // Check if a record already exists for THIS student
        let fingerprintRecord = await Fingerprint.findOne({ studentId: user.studentId });

        if (fingerprintRecord) {
            // Update existing token
            fingerprintRecord.fingerprintHash = biometricToken;
            await fingerprintRecord.save();
        } else {
            // Create new record
            fingerprintRecord = await Fingerprint.create({
                studentId: user.studentId,
                fingerprintHash: biometricToken,
            });
        }

        return NextResponse.json(
            { message: "Biometric data registered successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Biometric registration error:", error);
        return NextResponse.json(
            { error: "Failed to register biometrics" },
            { status: 500 }
        );
    }
}
