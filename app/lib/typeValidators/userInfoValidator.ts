import {type UserInfo, UserInfoSchema} from "@/app/models/auth/userInfo";

export function isUserInfo(x: unknown): x is UserInfo {
    return UserInfoSchema.safeParse(x).success;
}

export function mapToUserInfo(x: unknown): UserInfo | null {
    const result = UserInfoSchema.safeParse(x);
    return result.success ? result.data : null;
}
