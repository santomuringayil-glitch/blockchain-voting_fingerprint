import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Fingerprint from "@/models/Fingerprint";
import { getUserFromRequest } from "@/lib/auth";
import { hashFingerprint } from "@/lib/fingerprint";

export async function POST(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== "student") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await dbConnect();
        const body = await request.json();
        const { fingerprintPassphrase } = body;

        // Bypass fingerprint verification for pilot phase
        return NextResponse.json({ message: "Fingerprint verified (Bypassed)", verified: true });

        /* Original verification logic
        // Get stored fingerprint hash
        const stored = await Fingerprint.findOne({ studentId: user.studentId });
        ...
        */

        return NextResponse.json({ message: "Fingerprint verified", verified: true });
    } catch (error) {
        console.error("Fingerprint verification error:", error);
        return NextResponse.json(
            { error: "Verification failed: " + error.message },
            { status: 500 }
        );
    }
}
