import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

interface Subscription {
    virtualDeviceId: string;
    metricsAttributeId: string;
    startTime: number;
    endTime?: number;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class TelemetryGateway {
    @WebSocketServer()
    server: Server;

    /**
     * LIVE subscriptions
     * vid -> metricId -> Set<WebSocket>
     */
    private liveSubs = new Map<string, Map<string, Set<WebSocket>>>();

    /**
     * Track client subscription (1 active subscription per client)
     */
    private clientSubs = new Map<WebSocket, Subscription>();

    handleConnection(client: WebSocket) {
        console.log('WS client connected');

        client.on('message', async (raw) => {
            try {
                const msg = JSON.parse(raw.toString());

                if (msg.event !== 'subscribe' || !msg.data) {
                    console.warn('Invalid WS message', msg);
                    return;
                }

                const {
                    virtualDeviceId,
                    metricsAttributeId,
                    startTime,
                    endTime,
                } = msg.data;

                if (!virtualDeviceId || !metricsAttributeId || !startTime) {
                    console.warn('Missing subscribe fields');
                    return;
                }

                // 1️⃣ Clean old subscription if exists
                this.cleanupClient(client);

                // 2️⃣ Save new subscription
                const sub: Subscription = {
                    virtualDeviceId,
                    metricsAttributeId,
                    startTime,
                    endTime,
                };
                this.clientSubs.set(client, sub);

                // 3️⃣ Send HISTORY first
                await this.sendHistory(client, sub);

                // 4️⃣ Register for LIVE updates
                this.addLiveSubscription(client, sub);

                console.log(
                    `Subscribed: ${virtualDeviceId} | ${metricsAttributeId} | ${startTime}-${endTime}`,
                );
            } catch (err) {
                console.error('WS message parse error', err);
            }
        });

        client.on('close', () => {
            this.cleanupClient(client);
            this.clientSubs.delete(client);
            console.log('WS client disconnected');
        });
    }

    // ------------------------------------
    // HISTORY
    // ------------------------------------
    private async sendHistory(client: WebSocket, sub: Subscription) {

        const historyData = await this.mockHistoryFetch(
            sub.virtualDeviceId,
            sub.metricsAttributeId,
            sub.startTime,
            sub.endTime,
        );

        if (historyData.length === 0) return;

        client.send(
            JSON.stringify({
                type: 'HISTORY',
                data: historyData,
            }),
        );
    }

    // ------------------------------------
    // LIVE SUBSCRIPTION
    // ------------------------------------
    private addLiveSubscription(client: WebSocket, sub: Subscription) {
        const { virtualDeviceId, metricsAttributeId } = sub;

        if (!this.liveSubs.has(virtualDeviceId)) {
            this.liveSubs.set(virtualDeviceId, new Map());
        }

        const metricMap = this.liveSubs.get(virtualDeviceId)!;

        if (!metricMap.has(metricsAttributeId)) {
            metricMap.set(metricsAttributeId, new Set());
        }

        metricMap.get(metricsAttributeId)!.add(client);
    }

    // ------------------------------------
    // CLEANUP
    // ------------------------------------
    private cleanupClient(client: WebSocket) {
        const sub = this.clientSubs.get(client);
        if (!sub) return;

        const metricMap = this.liveSubs.get(sub.virtualDeviceId);
        if (!metricMap) return;

        const sockets = metricMap.get(sub.metricsAttributeId);
        sockets?.delete(client);

        if (sockets?.size === 0) {
            metricMap.delete(sub.metricsAttributeId);
        }

        if (metricMap.size === 0) {
            this.liveSubs.delete(sub.virtualDeviceId);
        }
    }

    // ------------------------------------
    // PUSH LIVE DATA (called from service)
    // ------------------------------------
    public pushLiveTelemetry(virtualDeviceId: string, payload: any) {
        const metricId = payload.metric?.metricsAttributeId;
        if (!metricId) return;

        const metricMap = this.liveSubs.get(virtualDeviceId);
        const sockets = metricMap?.get(metricId);
        if (!sockets) return;

        const msg = JSON.stringify({
            type: 'LIVE',
            data: payload,
        });

        console.log(msg)

        sockets.forEach((ws) => {
            if (ws.readyState === ws.OPEN) {
                ws.send(msg);
            }
        });
    }

    // ------------------------------------
    // MOCK HISTORY FETCH (REPLACE WITH DB)
    // ------------------------------------
    private async mockHistoryFetch(
        vid: string,
        metricId: string,
        start: number,
        end?: number,
    ) {
        return [
            {
                virtualDeviceId: vid,
                metric: {
                    metricsAttributeId: metricId,
                    value: 12.3,
                    timestamp: start + 1000,
                },
            },
            {
                virtualDeviceId: vid,
                metric: {
                    metricsAttributeId: metricId,
                    value: 13.1,
                    timestamp: start + 2000,
                },
            },
        ];
    }
}
