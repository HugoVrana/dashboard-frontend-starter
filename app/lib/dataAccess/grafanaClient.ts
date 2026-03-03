'use client'

import {LogCreate} from "@/app/models/log/logCreate";
import {mapToLogCreate} from "@/app/lib/typeValidators/logValidator";

export default class GrafanaClient {
    private readonly service : string;
    private readonly environment : string;

    constructor() {
        this.service = process.env.NEXT_PUBLIC_APP_NAME || 'nextjs-dashboard';
        this.environment = process.env.NODE_ENV || 'development';
    }

    private async sendToLoki(logCreate: LogCreate): Promise<number | undefined> {
        try {
            return await this.sendClientSide(logCreate);
        }
        catch (e) {
            console.error('Failed to send log to Loki:', e);
            return undefined;
        }
    }

    private async sendClientSide(logCreate: LogCreate) : Promise<number | undefined> {
        const response = await fetch('/api/loki', {
            method: 'POST',
            body: JSON.stringify(logCreate),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Loki push failed:', response.status, await response.text());
            return undefined;
        }

        return response.status;
    }

    public info(message: string, meta: any = {}) : LogCreate {
        const logCreate : LogCreate = mapToLogCreate('info', message, this.service, this.environment,  meta);
        this.sendToLoki(logCreate).catch();
        return logCreate;
    }

    public warning(message: string, meta: any = {}) : LogCreate {
        const logCreate : LogCreate = mapToLogCreate('warning', message, this.service, this.environment,  meta);
        this.sendToLoki(logCreate).catch();
        return logCreate;
    }

    public error(message: string, meta: any = {}) : LogCreate {
        const logCreate : LogCreate = mapToLogCreate('error', message, this.service, this.environment,  meta);
        this.sendToLoki(logCreate).catch();
        return logCreate;
    }

    public debug(message: string, meta: any = {}) : LogCreate {
        const logCreate : LogCreate = mapToLogCreate('debug', message, this.service, this.environment,  meta);
        this.sendToLoki(logCreate).catch();
        return logCreate;
    }
}