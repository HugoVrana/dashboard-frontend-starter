"use client"

import GrafanaClient from "@/app/lib/dataAccess/grafanaClient";
import {getDashboardAuthLocalUrl, getDashboardAuthRenderUrl} from "@/app/lib/devOverlay/dashboardAuthApiContext";

const grafanaClient : GrafanaClient = new GrafanaClient();

function isValidUrl(str: string): boolean {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

export async function getUserProfileImageUrl(isLocal : boolean, userId : string) : Promise<string | null> {
    const baseUrl : string = isLocal ? getDashboardAuthLocalUrl() : getDashboardAuthRenderUrl();
    const u : URL = new URL(`api/user/${userId}/profilePicture`, baseUrl);

    try {
        const res : Response = await fetch(u.toString(), {
            method : "GET",
            headers : {
                "Content-Type" : "application/json"
            }
        });

        if (!res.ok) {
            console.error("API error:", res.status, res.statusText);
            grafanaClient.error("API error", {route: `GET /${userId}/profilePicture`, status: res.status, statusText: res.statusText});
            return null;
        }

        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body", {route: `GET /${userId}/profilePicture`});
            console.log("Empty response body");
            return null;
        }

        const imageUrl = text.trim();
        if (!isValidUrl(imageUrl)) {
            grafanaClient.error("Invalid URL in response", {route: `GET /${userId}/profilePicture`, response: imageUrl});
            console.error("Invalid URL in response:", imageUrl);
            return null;
        }
        return imageUrl;
    }
    catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /invoices/amount", error: e});
        console.error("Error processing response:", e);
        return null;
    }
}