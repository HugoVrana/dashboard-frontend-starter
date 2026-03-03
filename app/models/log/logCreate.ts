import {z} from "zod";

export const LogCreateSchema = z.object({
    timestamp: z.string(),
    level: z.string(),
    message: z.string(),
    service: z.string(),
    environment: z.string(),
    route: z.string().optional(),
    error: z.object({}).passthrough().optional(),
}).passthrough();

export type LogCreate = z.infer<typeof LogCreateSchema> & {
    [key: string]: unknown;
};
