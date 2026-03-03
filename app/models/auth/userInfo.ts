import {z} from "zod";
import {RoleReadSchema} from "./role";

export const UserInfoSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    profileImageUrl: z.string().url().nullable().optional().transform(val => val ?? null),
    roleReads: z.array(RoleReadSchema),
});

export type UserInfo = z.infer<typeof UserInfoSchema>;
