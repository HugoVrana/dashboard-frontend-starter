import {auth} from "@/auth";
import {NextResponse} from "next/server";

// makes sure that only logged in users can access the dashboard
export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");

    if (isOnDashboard && !isLoggedIn) {
        const loginUrl = new URL("/auth/login", req.nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/dashboard/:path*"],
};
