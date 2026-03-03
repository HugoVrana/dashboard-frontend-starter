import {type UserRead, UserReadSchema} from "@/app/models/user/userRead";
import {createPageSchema, type PageResponse} from "@/app/models/page/pageResponse";

// Page schema for users
const UserReadPageSchema = createPageSchema(UserReadSchema);

export function isUserRead(x: unknown): x is UserRead {
    return UserReadSchema.safeParse(x).success;
}

export function mapToUserRead(x: unknown): UserRead | null {
    const result = UserReadSchema.safeParse(x);
    return result.success ? result.data : null;
}

export function mapToUserReadPage(x: unknown): PageResponse<UserRead> | null {
    const result = UserReadPageSchema.safeParse(x);
    return result.success ? result.data : null;
}