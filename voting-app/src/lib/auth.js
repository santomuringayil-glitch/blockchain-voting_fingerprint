import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// These functions use 'jsonwebtoken' which is Node-only.
// In a real production app for Edge, you would use 'jose'.
// For this project, we'll ensure they are only called in API routes (Node runtime).

export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export function getTokenFromCookies(request) {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/token=([^;]+)/);
    return match ? match[1] : null;
}

export async function getUserFromRequest(request) {
    const token = getTokenFromCookies(request);
    if (!token) return null;
    return verifyToken(token);
}
