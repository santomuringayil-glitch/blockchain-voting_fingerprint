import { NextResponse } from "next/server";

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // VERY PLAIN MIDDLEWARE - NO IMPORTS
    const publicPaths = ["/login", "/register", "/admin/register", "/api/auth", "/auth", "/forgot-password", "/forgot-password-email", "/reset-password"];
    console.log("MIDDLEWARE: Request for", pathname);
    const isPublic = publicPaths.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
    );
    console.log("MIDDLEWARE: Is public?", isPublic);

    if (isPublic || pathname === "/") {
        return NextResponse.next();
    }

    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Temporarily skip verification in middleware to avoid Node module hangs
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
    ],
};
