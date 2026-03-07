import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // 1. Find the student
        const student = await Student.findOne({ email });

        if (!student) {
            // For security, don't explicitly say the email doesn't exist to prevent enumeration attacks,
            // but for a student project, an explicit error is often preferred for UX.
            return NextResponse.json(
                { error: "No student account found with this email" },
                { status: 404 }
            );
        }

        // 2. Generate a highly secure, short-lived JWT token
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET is not configured");

        const token = jwt.sign(
            { studentId: student.studentId, email: student.email },
            secret,
            { expiresIn: '15m' } // Token expires strictly in 15 minutes
        );

        // 3. Construct the reset link
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const resetLink = `${appUrl}/reset-password/${token}`;

        // 4. Send the email using Nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: '"BlockVote Security" <no-reply@blockvote.edu>',
            to: email,
            subject: "Your BlockVote Password Reset Link",
            text: `You requested a password reset for your BlockVote account.\n\nPlease click the following link to reset your password. This link will expire in 15 minutes:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #4f46e5; text-align: center;">BlockVote Password Reset</h2>
                    <p>Hello ${student.fullName},</p>
                    <p>We received a request to reset the password for your student ID <strong>${student.studentId}</strong>.</p>
                    <p>Click the button below to securely reset your password. <strong>This link ensures your security by expiring in exactly 15 minutes.</strong></p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Reset My Password</a>
                    </div>
                    <p style="color: #666; font-size: 14px;">If the button does not work, copy and paste this link into your browser:</p>
                    <p style="color: #666; font-size: 14px; word-break: break-all;">${resetLink}</p>
                    <br/>
                    <p style="color: #888; font-size: 12px;">If you did not request a password reset, you can safely ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json(
            { message: "Reset email dispatched successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Email dispatch error:", error);
        return NextResponse.json(
            { error: "Failed to send email. Please check server configurations." },
            { status: 500 }
        );
    }
}
