// Simple logger that works in both server and client environments
import {LogCreate} from "@/app/models/log/logCreate";
import {mapToLogCreate} from "@/app/lib/typeValidators/logValidator";

export default class GrafanaServerClient {
    private readonly service: string;
    private readonly environment: string;

    constructor() {
        // Only use Loki URL on the server side
        this.service = process.env.NEXT_PUBLIC_APP_NAME || 'nextjs-dashboard';
        this.environment = process.env.NODE_ENV || 'development';
    }

    private async sendToLoki(logCreate: LogCreate): Promise<number | undefined> {
        try {
            const lokiUrl : string | undefined = process.env.NEXT_PUBLIC_LOKI_URL;
            const lokiToken : string | undefined = process.env.NEXT_PUBLIC_LOKI_TOKEN;

            if (!lokiUrl || !lokiToken) {
                console.error('Loki configuration missing');
                return undefined;
            }

            // Loki expects nanosecond timestamps as strings
            const nanosecondTimestamp = (Date.parse(logCreate.timestamp) * 1_000_000).toString();

            // Build the log line as JSON string (excluding labels)
            const { level, service, environment, timestamp, ...rest } = logCreate;
            const logLine : string = JSON.stringify(rest);

            // Loki push API format
            const lokiPayload = {
                streams: [
                    {
                        stream: {
                            level: logCreate.level,
                            service: logCreate.service,
                            environment: logCreate.environment,
                        },
                        values: [
                            [nanosecondTimestamp, logLine]
                        ]
                    }
                ]
            };

            const response : Response = await fetch(lokiUrl, {
                method: 'POST',
                body: JSON.stringify(lokiPayload),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${lokiToken}`,
                },
            });

            if (!response.ok) {
                console.error('Loki push failed:', response.status, await response.text());
                return undefined;
            }
            return response.status;
        }
        catch (e) {
            console.error('Failed to send log to Loki:', e);
            return undefined;
        }
    }

    public async info(message: string, meta: any = {}) : Promise<LogCreate> {
        const logCreate : LogCreate = mapToLogCreate('info', message, this.service, this.environment,  meta);
        this.sendToLoki(logCreate).catch();
        return logCreate;
    }

    public async warning(message: string, meta: any = {}) : Promise<LogCreate> {
        const logCreate : LogCreate = mapToLogCreate('warning', message, this.service, this.environment,  meta);
        this.sendToLoki(logCreate).catch();
        return logCreate;
    }

    public async error(message: string, meta: any = {}) : Promise<LogCreate> {
        const logCreate : LogCreate = mapToLogCreate('error', message, this.service, this.environment,  meta);
        this.sendToLoki(logCreate).catch();
        return logCreate;
    }

    public async debug(message: string, meta: any = {}) : Promise<LogCreate> {
        const logCreate : LogCreate = mapToLogCreate('debug', message, this.service, this.environment,  meta);
        this.sendToLoki(logCreate).catch();
        return logCreate;
    }
}