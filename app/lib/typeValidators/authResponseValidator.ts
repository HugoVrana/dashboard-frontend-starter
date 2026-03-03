import {type AuthResponse, AuthResponseSchema} from "@/app/models/auth/authResponse";

export function isAuthResponse(x: unknown): x is AuthResponse {
    return AuthResponseSchema.safeParse(x).success;
}

export function mapToAuthResponse(x: unknown): AuthResponse | null {
    const result = AuthResponseSchema.safeParse(x);
    return result.success ? result.data : null;
}
