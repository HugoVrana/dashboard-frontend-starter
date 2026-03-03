import {Client, IMessage} from '@stomp/stompjs';

export type ActivityCallback = (event: unknown) => void;

export interface ActivitySubscription {
    unsubscribe: () => void;
}

export class ActivityClient {
    private client: Client;
    private subscriptions: Map<string, ActivityCallback[]> = new Map();
    private url: string;

    constructor(url: string) {
        this.url = url;
        this.client = new Client({
            brokerURL: url,
            onConnect: () => {
                console.log(`Connected to WebSocket: ${url}`);
                this.resubscribeAll();
            },
            onDisconnect: () => {
                console.log(`Disconnected from WebSocket: ${url}`);
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame.headers['message']);
            },
        });
    }

    connect(): void {
        this.client.activate();
    }

    disconnect(): void {
        this.client.deactivate();
    }

    subscribe(topic: string, callback: ActivityCallback): ActivitySubscription {
        const callbacks = this.subscriptions.get(topic) || [];
        callbacks.push(callback);
        this.subscriptions.set(topic, callbacks);

        if (this.client.connected) {
            this.subscribeToTopic(topic);
        }

        return {
            unsubscribe: () => {
                const cbs = this.subscriptions.get(topic) || [];
                const index = cbs.indexOf(callback);
                if (index > -1) {
                    cbs.splice(index, 1);
                }
            },
        };
    }

    private subscribeToTopic(topic: string): void {
        this.client.subscribe(topic, (message: IMessage) => {
            const event = JSON.parse(message.body);
            const callbacks = this.subscriptions.get(topic) || [];
            callbacks.forEach((cb) => cb(event));
        });
    }

    private resubscribeAll(): void {
        this.subscriptions.forEach((_, topic) => {
            this.subscribeToTopic(topic);
        });
    }

    get isConnected(): boolean {
        return this.client.connected;
    }
}
