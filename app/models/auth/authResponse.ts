import {z} from "zod";
import {UserInfoSchema} from "./userInfo";

export const AuthResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
    user: UserInfoSchema.nullable(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
