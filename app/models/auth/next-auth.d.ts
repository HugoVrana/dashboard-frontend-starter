import {DefaultSession} from "@/next-auth";
import {Role} from "./role";

declare module "next-auth" {
    interface Session {
        expiresAt: number;
        user: {
            id: string;
            role: Role[];
        } & DefaultSession["user"];
        accessToken: string;
        refreshToken : string;
        url : string;
    }

    interface User {
        id: string;
        email: string;
        role: Role[];
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        url: string;
        imageUrl: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: Role[];
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
        image: string | null;
    }
}