import {z} from "zod";
import {GrantReadSchema} from "./grantRead";

export const RoleReadSchema = z.object({
    id: z.string(),
    name: z.string(),
    grants: z.array(GrantReadSchema),
});

export type RoleRead = z.infer<typeof RoleReadSchema>;
