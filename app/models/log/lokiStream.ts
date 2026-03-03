import {LogCreate} from "./logCreate";

export interface LokiStream {
    streams: {
        stream: Record<string, string>;
        values: [string, string][];
    }[];
}

export function toLokiFormat(logCreate: LogCreate): LokiStream {
    const { timestamp, level, message, service, environment, ...rest } = logCreate;

    // Convert ISO timestamp to nanoseconds
    const nanoTimestamp : string = (new Date(logCreate.timestamp).getTime() * 1_000_000).toString();

    return {
        streams: [
            {
                stream: {
                    service,
                    environment,
                    level,
                },
                values: [
                    [nanoTimestamp, JSON.stringify({ message, ...rest })]
                ]
            }
        ]
    };
}