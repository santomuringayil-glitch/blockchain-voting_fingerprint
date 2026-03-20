import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Election from "@/models/Election";
import { getUserFromRequest } from "@/lib/auth";
import { deployVotingContract } from "@/lib/contract";

export async function POST(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await dbConnect();
        const body = await request.json();
        const { title, description, startDate, endDate, electionCode: customElectionCode } = body;

        if (!title || !startDate || !endDate) {
            return NextResponse.json(
                { error: "Title, start date, and end date are required" },
                { status: 400 }
            );
        }

        // Deploy a new Voting contract
        let contractAddress = "";
        try {
            contractAddress = await deployVotingContract();
        } catch (e) {
            console.warn("Contract deployment failed (Ganache may not be running):", e.message);
        }

        // Generate a unique election code (e.g., ELECTION-20231001-0001)
        const generateElectionCode = async (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            const dateStr = `${year}${month}${day}`;

            // Find elections starting on the same day
            const startOfDay = new Date(d.setHours(0, 0, 0, 0));
            const endOfDay = new Date(d.setHours(23, 59, 59, 999));

            const count = await Election.countDocuments({
                startDate: { $gte: startOfDay, $lte: endOfDay }
            });

            const sequentialNum = String(count + 1).padStart(4, "0");
            return `ELECTION-${dateStr}-${sequentialNum}`;
        };

        const finalElectionCode = customElectionCode && customElectionCode.trim() !== "" 
            ? customElectionCode.trim() 
            : await generateElectionCode(startDate);

        const existingCounterpart = await Election.findOne({ electionCode: finalElectionCode });
        if (existingCounterpart) {
            return NextResponse.json(
                { error: `An election with the ID "${finalElectionCode}" already exists. Please provide a different Custom Election ID.` },
                { status: 400 }
            );
        }

        const election = await Election.create({
            title,
            description: description || "",
            electionCode: finalElectionCode,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            contractAddress,
            createdBy: user.userId,
            status: "upcoming",
        });

        // --- Send Email Notification to All Students ---
        try {
            const Student = (await import("@/models/Student")).default;
            const students = await Student.find({ role: "student" }).select("email fullName");
            
            if (students.length > 0) {
                const nodemailer = await import("nodemailer");
                const transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: process.env.EMAIL_PORT,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
                
                // Map to promises to send concurrently
                const emailPromises = students.map(student => {
                    const mailOptions = {
                        from: '"BlockVote Admin" <no-reply@blockvote.edu>',
                        to: student.email,
                        subject: `New Election Announced: ${election.title}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1e1e2f; border-radius: 8px; background-color: #f8fafc; color: #334155;">
                                <h2 style="color: #4f46e5; text-align: center; margin-bottom: 24px;">🗳️ New Election Announced</h2>
                                <p style="font-size: 16px;">Hello <strong>${student.fullName}</strong>,</p>
                                <p style="font-size: 16px;">A new election has been scheduled and your participation is requested.</p>
                                
                                <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4f46e5;">
                                    <h3 style="margin-top: 0; color: #1e293b;">${election.title}</h3>
                                    <p style="margin: 5px 0;"><strong>Start Date:</strong> ${new Date(election.startDate).toLocaleDateString()}</p>
                                    <p style="margin: 5px 0;"><strong>End Date:</strong> ${new Date(election.endDate).toLocaleDateString()}</p>
                                    <p style="margin: 5px 0;"><strong>Election Code:</strong> 
                                        <span style="background: #e0e7ff; color: #4338ca; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-family: monospace; letter-spacing: 1px;">
                                            ${election.electionCode}
                                        </span>
                                    </p>
                                </div>
                                
                                <p style="font-size: 16px;">You will need the <strong>Election Code</strong> above if you are joining the election manually via the dashboard.</p>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${appUrl}/student/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Go to Dashboard</a>
                                </div>
                                
                                <p style="color: #64748b; font-size: 13px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
                                    BlockVote System - Secure & Transparent Campus Voting
                                </p>
                            </div>
                        `
                    };
                    return transporter.sendMail(mailOptions);
                });

                // Wait for all emails to send, ignore individual failures so the request still succeeds
                await Promise.allSettled(emailPromises);
                console.log(`Dispatched election notification emails to ${students.length} students.`);
            }
        } catch (emailError) {
            console.error("Failed to send election notification emails:", emailError);
            // We don't block the election creation response even if emails fail
        }

        return NextResponse.json(
            { message: "Election created successfully", election },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create election error:", error);
        return NextResponse.json(
            { error: "Failed to create election: " + error.message },
            { status: 500 }
        );
    }
}
