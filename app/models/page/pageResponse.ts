import {z} from "zod";

// Generic page schema factory
export function createPageSchema<T extends z.ZodTypeAny>(itemSchema: T) {
    return z.object({
        totalPages: z.number(),
        currentPage: z.number(),
        itemsPerPage: z.number(),
        data: z.array(itemSchema),
    });
}

// Type definition
export type PageResponse<T> = {
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    data: T[];
};
