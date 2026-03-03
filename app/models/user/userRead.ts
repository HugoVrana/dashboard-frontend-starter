import {z} from "zod";

export const UserReadSchema = z.object({
    id: z.union([z.string(), z.number()]).transform(String),
    name: z.string(),
    email: z.string(),
    password: z.string(),
});

export type UserRead = z.infer<typeof UserReadSchema>;
