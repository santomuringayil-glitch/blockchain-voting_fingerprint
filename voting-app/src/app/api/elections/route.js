import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Election from "@/models/Election";

export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        const filter = {};
        if (status) {
            filter.status = status;
        }

        const elections = await Election.find(filter).sort({ createdAt: -1 });

        return NextResponse.json({ elections });
    } catch (error) {
        console.error("Fetch elections error:", error);
        return NextResponse.json(
            { error: "Failed to fetch elections" },
            { status: 500 }
        );
    }
}
