import {z} from "zod";

export const TotpSetupResponseSchema = z.object({
    qrCodeDataUri : z.string(),
    secret : z.string()
});

export type TotpSetupResponse = z.infer<typeof TotpSetupResponseSchema>;