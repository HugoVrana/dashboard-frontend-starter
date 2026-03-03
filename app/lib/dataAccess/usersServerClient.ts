import GrafanaServerClient from "@/app/lib/dataAccess/grafanaServerClient";
import {RegisterRequest} from "@/app/models/auth/registerRequest";
import {isUserInfo, mapToUserInfo} from "@/app/lib/typeValidators/userInfoValidator";
import {LoginRequest} from "@/app/models/auth/loginRequest";
import {UserInfo} from "@/app/models/auth/userInfo";
import {AuthResponse} from "@/app/models/auth/authResponse";
import {isAuthResponse, mapToAuthResponse} from "@/app/lib/typeValidators/authResponseValidator";
import {TotpSetupResponse, TotpSetupResponseSchema} from "@/app/models/auth/totpSetupResponse";

const grafanaClient : GrafanaServerClient = new GrafanaServerClient();

export async function createUser(serverUrl : string, registerRequest : RegisterRequest) : Promise<UserInfo | null> {
    try {
        const url = new URL("api/auth/register", serverUrl);

        registerRequest.roleId = "6939575c98f5fc7bd2216a79";

        const res : Response = await fetch(url.toString(), {
            method: "POST",
            body : JSON.stringify(registerRequest),
            headers : {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
                // Don't ever add auth token here
            }
        });

        if (!res.ok) {
            console.error("API error", res.status, res.statusText);
            grafanaClient.error("API error", {route: "POST /api/auth/register", status: res.status, statusText: res.statusText});
            return null;
        }

        const result  = await res.json();
        console.log("Created User : " + result);
        grafanaClient.info("Created User", {route : "POST /api/auth/register", user : result});

        if (!isUserInfo(result)) {
            grafanaClient.error("Unexpected payload:", {route: "POST /api/auth/register", payload: result});
            console.error("Unexpected payload:", result);
            return null;

        }

        let userinfo : UserInfo | null = mapToUserInfo(result);
        if (!userinfo) {
            grafanaClient.error("Unexpected payload:", {route: "POST /api/auth/register", payload: result});
            console.error("Unexpected payload:", result);
            return null;
        }

        if (!userinfo.id) {
            grafanaClient.error("Unexpected payload:", {route: "POST /api/auth/register", payload: result});
            console.error("Unexpected payload:", result);
        }

        grafanaClient.info("Created User", {route : "POST /api/auth/register", response : userinfo});

        return userinfo;

    } catch (e) {
        console.error("Post failed:", e);
        grafanaClient.error("Post failed", {route: "POST /api/auth/register", error: e});
        return null;
    }
}

export async function loginUserWithTokens(
    serverUrl: string,
    loginRequest: LoginRequest
): Promise<AuthResponse | null> {
    try {
        const url = new URL("api/auth/login", serverUrl);

        const res : Response = await fetch(url.toString(), {
            method : "POST",
            body : JSON.stringify(loginRequest),
            headers : {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });

        if (!res.ok) {
            console.error("API error", res.status, res.statusText);
            return null;
        }

        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning no user", {route: "POST /auth/login"});
            console.log("Empty response body, returning null");
            return null;
        }

        const data : unknown = JSON.parse(text);
        if (!isAuthResponse(data)) {
            grafanaClient.error("Unexpected payload:", {route: "POST /auth/login", payload: data});
            console.error("Unexpected payload:", data);
            return null;
        }

        const authResponse : AuthResponse | null = mapToAuthResponse(data);
        if (!authResponse) {
            grafanaClient.error("Unexpected payload:", {route: "POST /auth/login", payload: data});
            console.error("Unexpected payload:", data);
            return null;
        }
        return authResponse;

    } catch (e) {
        console.error("Post failed:", e);
        return null;
    }
}

 export async function logoutUserWithToken(
     serverUrl: string,
     accessToken: string,
     refreshToken: string
 ): Promise<boolean> {
     try {
         const url = new URL("api/auth/logout", serverUrl);
         const res: Response = await fetch(url.toString(), {
             method: "POST",
             headers: {
                 Authorization : `Bearer ${accessToken}`
             }
         });
         return res.ok;
     } catch (e) {
         console.error("Logout failed:", e);
         return false;
     }
 }

export async function postUserProfilePicture(
    serverUrl: string,
    accessToken: string,
    file: File
): Promise<string | null> {
    try {
        const url = new URL("api/user/profilePicture", serverUrl);

        const formData = new FormData();
        formData.append("file", file);

        const res: Response = await fetch(url.toString(), {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            body: formData
        });

        if (!res.ok) {
            console.error("API error", res.status, res.statusText);
            grafanaClient.error("API error", {
                route: "POST /api/user/profilePicture",
                status: res.status,
                statusText: res.statusText
            });
            return null;
        }

        const publicUrl : string = await res.text();
        grafanaClient.info("Profile picture uploaded", {
            route: "POST /api/user/profilePicture",
            publicUrl
        });

        return publicUrl;
    } catch (e) {
        console.error("Setting profile pic failed:", e);
        grafanaClient.error("Setting profile pic failed", {
            route: "POST /api/user/profilePicture",
            error: e
        });
        return null;
    }
}

export async function setupTotp(
    serverUrl: string,
    accessToken: string
): Promise<TotpSetupResponse | null> {
    try {
        const url = new URL("api/auth/2fa/setup", serverUrl);

        const res: Response = await fetch(url.toString(), {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!res.ok) {
            console.error("API error", res.status, res.statusText);
            grafanaClient.error("API error", {
                route: "POST /api/auth/setupTotp",
                status: res.status,
                statusText: res.statusText
            });
            return null;
        }

        const text: string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body", {route: "POST /api/auth/setupTotp"});
            console.log("Empty response body, returning null");
            return null;
        }

        const data: unknown = JSON.parse(text);
        const parsed = TotpSetupResponseSchema.safeParse(data);

        if (!parsed.success) {
            grafanaClient.error("Unexpected payload:", {
                route: "POST /api/auth/setupTotp",
                payload: data,
                error: parsed.error
            });
            console.error("Unexpected payload:", data);
            return null;
        }

        grafanaClient.info("TOTP setup successful", {route: "POST /api/auth/setupTotp"});
        return parsed.data;
    } catch (e) {
        console.error("TOTP setup failed:", e);
        grafanaClient.error("TOTP setup failed", {
            route: "POST /api/auth/setupTotp",
            error: e
        });
        return null;
    }
}

export async function verifyTotp(
    serverUrl: string,
    accessToken: string,
    code: string
): Promise<boolean> {
    try {
        const url = new URL("api/auth/2fa/verify", serverUrl);

        const res: Response = await fetch(url.toString(), {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ code })
        });

        if (!res.ok) {
            console.error("TOTP verification failed", res.status, res.statusText);
            grafanaClient.error("TOTP verification failed", {
                route: "POST /api/auth/2fa/verify",
                status: res.status,
                statusText: res.statusText
            });
            return false;
        }

        grafanaClient.info("TOTP verified successfully", {route: "POST /api/auth/2fa/verify"});
        return true;
    } catch (e) {
        console.error("TOTP verification error:", e);
        grafanaClient.error("TOTP verification error", {
            route: "POST /api/auth/2fa/verify",
            error: e
        });
        return false;
    }
}