// @WebSocketGateway({ cors: { origin: '*' } })
// export class TelemetryGateway {
//     @WebSocketServer() server: Server;
//     private subscriptions = new Map<string, Map<string, Set<WebSocket>>>();
//     private clientSubMap = new Map<WebSocket, { vid: string; metricId: string }>();


//     handleConnection(client: WebSocket) {
//         console.log(Client connected);
//         client.on('message', (raw) => {
//             try {
//                 const msg = JSON.parse(raw.toString());
//                 const vid = msg.virtualDeviceId;
//                 const metricAttrId = msg.metric;
//                 if (!vid || !metricAttrId) {
//                     console.error('Invalid subscription message: missing vid or metric');
//                     return;
//                 } 
//                 this.subscribeClient(client, vid, metricAttrId);
//             }
//             catch (err) {
//                 console.error('Invalid message received', err);
//             }
//         });
//         client.on('close', () => {
//             // console.log(Client disconnected, cleaning up...); 
//             const vid = this.clientSubMap.get(client);
//             console.log(Client disconnected -> vid=${ JSON.stringify(vid) });
//             this.cleanupClient(client); this.clientSubMap.delete(client);
//         });
//     }
//     private subscribeClient(client: WebSocket, vid: string, metricAttrId: string) {
//         const old = this.clientSubMap.get(client);
//         if (old) {
//             const oldMap = this.subscriptions.get(old.vid);
//             if (oldMap) {
//                 const clients = oldMap.get(old.metricId);
//                 clients?.delete(client);
//                 if (clients?.size === 0) oldMap.delete(old.metricId);
//                 if (oldMap.size === 0) this.subscriptions.delete(old.vid);
//             }
//         }
//         if (!this.subscriptions.has(vid)) {
//             this.subscriptions.set(vid, new Map());
//         }
//         const metricMap = this.subscriptions.get(vid)!;
//         if (!metricMap.has(metricAttrId)) {
//             metricMap.set(metricAttrId, new Set());
//         }
//         metricMap.get(metricAttrId)!.add(client);
//         this.clientSubMap.set(client, { vid, metricId: metricAttrId });
//         console.log(Client subscribed to: ${ vid }: ${ metricAttrId });
//     }
//     private cleanupClient(client: WebSocket) {
//         const sub = this.clientSubMap.get(client);
//         if (!sub) return;
//         const metricMap = this.subscriptions.get(sub.vid);
//         if (!metricMap) return;
//         const clients = metricMap.get(sub.metricId);
//         clients?.delete(client);
//         if (clients?.size === 0) metricMap.delete(sub.metricId);
//         if (metricMap.size === 0) this.subscriptions.delete(sub.vid);
//     }
//     public sendToWebSocket(virtualDeviceId: string, devicePayloads: any[]) {
//         if (!devicePayloads.length) return;
//         const metricMap = this.subscriptions.get(virtualDeviceId);
//         if (!metricMap) return;
//         const groupedByMetric = new Map<string, any[]>();
//         for (const payload of devicePayloads) {
//             const metricId = payload.metric?.metricsAttributeId;
//             if (!metricId) continue;
//             if (!groupedByMetric.has(metricId)) {
//                 groupedByMetric.set(metricId, []);
//             }
//             groupedByMetric.get(metricId)!.push(payload);
//         } c
//         onsole.log("grp", groupedByMetric);
//         for (const [metricId, metricPayloads] of groupedByMetric.entries()) {
//             const sockets = metricMap.get(metricId);
//             if (!sockets || sockets.size === 0) continue;
//             const telemetryDevice = TelemetryDevice.createFromTelemetry(metricPayloads[0],);
//             const frequency = metricPayloads[0].metric.frequency;
//             const metrics = metricPayloads.map((rcvd) => getMetricDTO(rcvd.metric));
//             const telemetryDisplayProperty: TelemetryDisplayProperty = {
//                 metricsAttributeId: metricId,
//                 frequency,
//                 displayName: metricId,
//                 unit: metricPayloads[0].metric.unit,
//             };
//             const dto = new TelemetryPayloadDto(
//                 telemetryDevice,
//                 metrics,
//                 telemetryDisplayProperty,
//             );
//             const message = JSON.stringify(dto);
//             console.log(Sending to ${ virtualDeviceId }: ${ metricId } -> ${ message });
//             sockets.forEach((ws) => {
//                 if (ws.readyState === ws.OPEN) {
//                     ws.send(message);
//                 }
//             });
//         }
//     }
// }





import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { CurrentTelemetryPayload } from 'src/current-telemetry-payload/entities/current-telemetry-payload.entity';
import { TelemetryDevice } from 'src/telemetry-payload/dto/telemetry-device.dto';
import { TelemetryPayloadService } from 'src/telemetry-payload/telemetry-payload.service';
import { getMetricDTO } from 'src/utils/other';
import { Server, WebSocket } from 'ws';

const correctWoking = 1;
@WebSocketGateway({
    path: '/telemetry',
    cors: { origin: '*' }
})
// export class TelemetryGateway {
//     @WebSocketServer()
//     server: Server;

//     constructor(
//         private readonly telemetryPayloadService: TelemetryPayloadService,
//     ) { }

//     afterInit(server: Server) {
//         console.log('WebSocket Gateway initialized');
//     }
//     // Structure: vid -> metricId -> Set of clients
//     private subscriptions = new Map<string, Map<string, Set<WebSocket>>>();

//     // Each client can subscribe to multiple vids, but only one metricId
//     private clientSubMap = new Map<WebSocket, { vids: string[]; metricId: string }>();

//     handleConnection(client: WebSocket) {
//         console.log(`Client connected`);

//         client.on('message', async (raw) => {
//             try {
//                 console.log("Raw message:", raw.toString());
//                 const msg = JSON.parse(raw.toString());

//                 // const vids: string[] = Array.isArray(msg.virtualDeviceIds)
//                 //     ? msg.virtualDeviceIds
//                 //     : msg.virtualDeviceId
//                 //         ? [msg.virtualDeviceId]
//                 //         : [];

//                 const vids = msg.virtualDeviceIds ? msg.virtualDeviceIds : [];
//                 const metricAttrId = msg.metricsAttributeId;
//                 const startTime = msg.startTime;
//                 const endTime = msg.endTime;

//                 if (!vids.length || !metricAttrId) {
//                     console.error('Invalid subscription message: missing vids or metric');
//                     return;
//                 }

//                 if (startTime && endTime) {
//                     await this.sendHistory(client, vids, metricAttrId, startTime, endTime);
//                 }

//                 this.subscribeClient(client, vids, metricAttrId);
//             } catch (err) {
//                 console.error('Invalid message received', err);
//             }
//         });

//         client.on('close', () => {
//             const sub = this.clientSubMap.get(client);
//             console.log(`Client disconnected -> ${JSON.stringify(sub)}`);

//             this.cleanupClient(client);
//             this.clientSubMap.delete(client);
//         });
//     }

//     private subscribeClient(client: WebSocket, vids: string[], metricAttrId: string) {
//         // Cleanup old subscriptions if client re-subscribes
//         const old = this.clientSubMap.get(client);
//         if (old) {
//             for (const oldVid of old.vids) {
//                 const oldMap = this.subscriptions.get(oldVid);
//                 if (oldMap) {
//                     const clients = oldMap.get(old.metricId);
//                     clients?.delete(client);
//                     if (clients?.size === 0) oldMap.delete(old.metricId);
//                     if (oldMap.size === 0) this.subscriptions.delete(oldVid);
//                 }
//             }
//         }

//         // Add new subscriptions
//         for (const vid of vids) {
//             if (!this.subscriptions.has(vid)) {
//                 this.subscriptions.set(vid, new Map());
//             }
//             const metricMap = this.subscriptions.get(vid)!;

//             if (!metricMap.has(metricAttrId)) {
//                 metricMap.set(metricAttrId, new Set());
//             }
//             metricMap.get(metricAttrId)!.add(client);

//             console.log(`Client subscribed to: ${vid}:${metricAttrId}`);
//         }
//         this.clientSubMap.set(client, { vids, metricId: metricAttrId });
//     }

//     private cleanupClient(client: WebSocket) {
//         const sub = this.clientSubMap.get(client);
//         if (!sub) return;

//         for (const vid of sub.vids) {
//             const metricMap = this.subscriptions.get(vid);
//             if (!metricMap) continue;

//             const clients = metricMap.get(sub.metricId);
//             clients?.delete(client);

//             if (clients?.size === 0) metricMap.delete(sub.metricId);
//             if (metricMap.size === 0) this.subscriptions.delete(vid);
//         }
//     }

//     private buildDto(
//         virtualDeviceId: string,
//         metricId: string,
//         metricPayloads: any[],
//     ) {
//         const first = metricPayloads[0];

//         const telemetryDevice =
//             TelemetryDevice.createFromTelemetry(first);

//         const metrics =
//             metricPayloads.map(rcvd =>
//                 getMetricDTO(rcvd.metric),
//             );

//         const telemetryDisplayProperty = {
//             metricsAttributeId: metricId,
//             frequency: first.metric.frequency,
//             displayName: metricId,
//             unit: first.metric.unit,
//         };

//         return {
//             telemetryDevice,
//             metrics,
//             telemetryDisplayProperty,
//         };
//     }


//     private async sendHistory(
//         client: WebSocket,
//         vids: string[],
//         metricAttrId: string,
//         startTime: number,
//         endTime: number,
//     ) {
//         for (const vid of vids) {
//             const history = await this.fetchTelemetryHistory(
//                 vid,
//                 metricAttrId,
//                 startTime,
//                 endTime,
//             );

//             if (!history!.length) continue;

//             const dto = this.buildDto(vid, metricAttrId, history)

//             const payload = {
//                 type: 'HISTORY',
//                 // data: history,
//                 data: dto,
//             };

//             if (client.readyState === client.OPEN) {
//                 client.send(JSON.stringify(payload));
//             }
//         }
//     }

//     private async fetchTelemetryHistory(
//         vid: string,
//         metricsAttributeId: string,
//         startTime: number,
//         endTime: number,
//     ) {
//         const searchCriteriaObj = {
//             metricsAttributeId,
//             startTime,
//             endTime
//         }
//         console.log(searchCriteriaObj)
//         const result = await this.telemetryPayloadService.findForATimePeriod(searchCriteriaObj);
//         return result;
//     }


//     public sendToWebSocket(virtualDeviceId: string, devicePayloads: any[]) {
//         console.log('IN socket')
//         if (!devicePayloads.length) return;

//         const metricMap = this.subscriptions.get(virtualDeviceId);
//         if (!metricMap) return;

//         const groupedByMetric = new Map<string, any[]>();

//         for (const payload of devicePayloads) {
//             const metricId = payload.metric?.metricsAttributeId;
//             if (!groupedByMetric.has(metricId)) {
//                 groupedByMetric.set(metricId, []);
//             }
//             groupedByMetric.get(metricId)!.push(payload);
//         }

//         for (const [metricId, metricPayloads] of groupedByMetric.entries()) {
//             const sockets = metricMap.get(metricId);
//             if (!sockets || sockets.size === 0) continue;

//             // const telemetryDevice = TelemetryDevice.createFromTelemetry(metricPayloads[0]);
//             // const frequency = metricPayloads[0].metric.frequency;
//             // const metrics = metricPayloads.map((rcvd) => getMetricDTO(rcvd.metric));

//             // const telemetryDisplayProperty: TelemetryDisplayProperty = {
//             //     metricsAttributeId: metricId,
//             //     frequency,
//             //     displayName: metricId,
//             //     unit: metricPayloads[0].metric.unit,
//             // };

//             // const dto = new TelemetryPayloadDto(
//             //     telemetryDevice,
//             //     metrics,
//             //     telemetryDisplayProperty,
//             // );

//             const frequency = metricPayloads[0].metric.frequency;
//             const telemetryDevice = TelemetryDevice.createFromTelemetry(metricPayloads[0]);
//             const metrics = metricPayloads.map((rcvd) => getMetricDTO(rcvd.metric));

//             const telemetryDisplayProperty = {
//                 metricsAttributeId: metricId,
//                 frequency,
//                 displayName: metricId,
//                 unit: metricPayloads[0].metric.unit,
//             };

//             const dto = {
//                 telemetryDevice,
//                 metrics,
//                 telemetryDisplayProperty,
//             };
//             const message = JSON.stringify(dto);
//             console.log(`Sending to ${virtualDeviceId}:${metricId} -> ${message}`);

//             sockets.forEach((ws) => {
//                 if (ws.readyState === ws.OPEN) {
//                     ws.send(message);
//                 }
//             });
//         }
//     }
// }

export class TelemetryGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly telemetryPayloadService: TelemetryPayloadService,
    ) { }

    afterInit(server: Server) {
        console.log('WebSocket Gateway initialized');
    }

    // Structure: vid -> metricId -> Set of clients
    private subscriptions = new Map<string, Map<string, Set<WebSocket>>>();

    // Each client can subscribe to single vid, but only one metricId
    private clientSubMap = new Map<WebSocket, { vid: string; metricId: string }>();

    handleConnection(client: WebSocket) {
        console.log(`Client connected`);
        // 
        client.on('message', async (raw) => {
            try {
                console.log("Raw message:", raw.toString());
                const msg = JSON.parse(raw.toString());

                const vid = msg.data.virtualDeviceId;
                const metricAttrId = msg.data.metricsAttributeId;
                const startTime = msg.data.startTime;
                const endTime = msg.data.endTime;

                if (!vid || !metricAttrId) {
                    console.error('Invalid subscription message: missing vid or metric');
                    return;
                }

                if (startTime && endTime) {
                    await this.sendHistory(client, vid, metricAttrId, startTime, endTime);
                }

                this.subscribeClient(client, vid, metricAttrId);
            } catch (err) {
                console.error('Invalid message received', err);
            }
        });

        client.on('close', () => {
            const sub = this.clientSubMap.get(client);
            console.log(`Client disconnected -> ${JSON.stringify(sub)}`);

            this.cleanupClient(client);
            this.clientSubMap.delete(client);
        });
    }

    private subscribeClient(client: WebSocket, vid: string, metricAttrId: string) {
        // Cleanup old subscriptions if client re-subscribes
        const old = this.clientSubMap.get(client);
        if (old) {
            const oldMap = this.subscriptions.get(old.vid);
            if (oldMap) {
                const clients = oldMap.get(old.metricId);
                clients?.delete(client);
                if (clients?.size === 0) oldMap.delete(old.metricId);
                if (oldMap.size === 0) this.subscriptions.delete(old.vid);
            }
        }

        if (!this.subscriptions.has(vid)) {
            this.subscriptions.set(vid, new Map());
        }

        const metricMap = this.subscriptions.get(vid)!;

        if (!metricMap.has(metricAttrId)) {
            metricMap.set(metricAttrId, new Set());
        }

        metricMap.get(metricAttrId)!.add(client);

        console.log(`Client subscribed to: ${vid}:${metricAttrId}`);

        this.clientSubMap.set(client, { vid, metricId: metricAttrId });
    }

    private cleanupClient(client: WebSocket) {
        const sub = this.clientSubMap.get(client);
        if (!sub) return;

        const metricMap = this.subscriptions.get(sub.vid);
        if (!metricMap) return;

        const clients = metricMap.get(sub.metricId);
        clients?.delete(client);

        if (clients?.size === 0) metricMap.delete(sub.metricId);
        if (metricMap.size === 0) this.subscriptions.delete(sub.vid);
    }

    private buildDto(
        virtualDeviceId: string,
        metricId: string,
        metricPayloads: any[],
    ) {
        const first = metricPayloads[0];

        const telemetryDevice =
            TelemetryDevice.createFromTelemetry(first);

        const metrics =
            metricPayloads.map(rcvd =>
                getMetricDTO(rcvd.metric),
            );

        const telemetryDisplayProperty = {
            metricsAttributeId: metricId,
            frequency: first.metric.frequency,
            displayName: metricId,
            unit: first.metric.unit,
        };

        return {
            telemetryDevice,
            metrics,
            telemetryDisplayProperty,
        };
    }

    private async sendHistory(
        client: WebSocket,
        vid: string,
        metricAttrId: string,
        startTime: number,
        endTime: number,
    ) {
        const history = await this.fetchTelemetryHistory(
            vid,
            metricAttrId,
            startTime,
            endTime,
        );

        // console.log(history);
        if (!history!.length) return;

        const dto = this.buildDto(vid, metricAttrId, history);

        // console.log("dto", dto)
        const payload = {
            type: 'HISTORY',
            data: dto,
        };

        // console.log(payload);

        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(payload));
        }
    }

    private async fetchTelemetryHistory(
        vid: string,
        metricsAttributeId: string,
        startTime: number,
        endTime: number,
    ) {
        const searchCriteriaObj = {
            metricsAttributeId,
            startTime,
            endTime
        };
        // console.log(searchCriteriaObj);

        return await this.telemetryPayloadService.findForATimePeriod(searchCriteriaObj);
    }
    // 

    public sendToWebSocket(virtualDeviceId: string, devicePayloads: CurrentTelemetryPayload[]) {
        console.log('IN socket');
        if (!devicePayloads.length) return;

        const metricMap = this.subscriptions.get(virtualDeviceId);
        if (!metricMap) return;

        const groupedByMetric = new Map<string, CurrentTelemetryPayload[]>();

        // console.log(devicePayloads);

        for (const payload of devicePayloads) {
            const metricId = payload.metric?.metricsAttributeId;
            if (!groupedByMetric.has(metricId)) {
                groupedByMetric.set(metricId, []);
            }
            groupedByMetric.get(metricId)!.push(payload);
        }

        for (const [metricId, metricPayloads] of groupedByMetric.entries()) {
            const sockets = metricMap.get(metricId);
            if (!sockets || sockets.size === 0) continue;

            const frequency = metricPayloads[0].metric.frequency;
            const telemetryDevice = TelemetryDevice.createFromTelemetry(metricPayloads[0]);
            const metrics = metricPayloads.map((rcvd) => getMetricDTO(rcvd.metric));
            // 
            const telemetryDisplayProperty = {
                metricsAttributeId: metricId,
                frequency,
                displayName: metricId,
                unit: metricPayloads[0].metric.unit,
            };

            const dto = {
                type: "Live",
                data: {
                    telemetryDevice,
                    metrics,
                    telemetryDisplayProperty,
                }
            };

            const message = JSON.stringify(dto);
            console.log(`Sending to ${virtualDeviceId}:${metricId} -> ${message}`);

            sockets.forEach((ws) => {
                if (ws.readyState === ws.OPEN) {
                    ws.send(message);
                }
            });
        }
    }
}


// @WebSocketGateway({ path: '/telemetry' })
// export class TelemetryGateway {
//     @WebSocketServer()
//     server: Server;

//     constructor(
//         private readonly telemetryPayloadService: TelemetryPayloadService,
//     ) { }

//     // vid -> metricId -> sockets
//     private subscriptions = new Map<string, Map<string, Set<WebSocket>>>();

//     // socket -> { vids, metricId }
//     private clientSubMap = new Map<WebSocket, { vids: string[]; metricId: string }>();

//     afterInit() {
//         console.log('WebSocket Gateway initialized');
//     }

//     /* ───────────────── CONNECTION ───────────────── */

//     handleConnection(client: WebSocket) {
//         console.log('Client connected');

//         client.on('message', (raw) => this.handleMessage(client, raw));
//         client.on('close', () => this.handleDisconnect(client));
//     }

//     private async handleMessage(client: WebSocket, raw: WebSocket.RawData) {
//         try {
//             const msg = JSON.parse(raw.toString());
//             const { virtualDeviceIds = [], metricsAttributeId, startTime, endTime } = msg;

//             if (!virtualDeviceIds.length || !metricsAttributeId) {
//                 console.error('Invalid subscription payload');
//                 return;
//             }

//             if (startTime && endTime) {
//                 await this.sendHistory(
//                     client,
//                     virtualDeviceIds,
//                     metricsAttributeId,
//                     startTime,
//                     endTime,
//                 );
//             }

//             this.subscribe(client, virtualDeviceIds, metricsAttributeId);
//         } catch (err) {
//             console.error('Invalid WebSocket message', err);
//         }
//     }

//     private handleDisconnect(client: WebSocket) {
//         console.log('Client disconnected');
//         this.unsubscribe(client);
//         this.clientSubMap.delete(client);
//     }

//     /* ───────────────── SUBSCRIPTIONS ───────────────── */

//     private subscribe(
//         client: WebSocket,
//         vids: string[],
//         metricId: string,
//     ) {
//         this.unsubscribe(client);

//         vids.forEach((vid) => {
//             const metricMap =
//                 this.subscriptions.get(vid) ??
//                 this.subscriptions.set(vid, new Map()).get(vid)!;

//             const sockets =
//                 metricMap.get(metricId) ??
//                 metricMap.set(metricId, new Set()).get(metricId)!;

//             sockets.add(client);
//             console.log(`Subscribed -> ${vid}:${metricId}`);
//         });

//         this.clientSubMap.set(client, { vids, metricId });
//     }

//     private unsubscribe(client: WebSocket) {
//         const sub = this.clientSubMap.get(client);
//         if (!sub) return;

//         sub.vids.forEach((vid) => {
//             const metricMap = this.subscriptions.get(vid);
//             if (!metricMap) return;

//             const sockets = metricMap.get(sub.metricId);
//             sockets?.delete(client);

//             if (!sockets?.size) metricMap.delete(sub.metricId);
//             if (!metricMap.size) this.subscriptions.delete(vid);
//         });
//     }

//     /* ───────────────── HISTORY ───────────────── */

//     private async sendHistory(
//         client: WebSocket,
//         vids: string[],
//         metricId: string,
//         startTime: number,
//         endTime: number,
//     ) {
//         for (const vid of vids) {
//             const historyPayloads = await this.fetchHistory(
//                 vid,
//                 metricId,
//                 startTime,
//                 endTime,
//             );

//             if (!historyPayloads.length) continue;
//             if (client.readyState !== client.OPEN) continue;

//             const dto = this.buildDto(metricId, historyPayloads);

//             client.send(JSON.stringify({
//                 type: 'HISTORY',
//                 data: dto,
//             }));
//         }
//     }


//     private fetchHistory(
//         vid: string,
//         metricsAttributeId: string,
//         startTime: number,
//         endTime: number,
//     ) {
//         return this.telemetryPayloadService.findForATimePeriod({
//             metricsAttributeId,
//             startTime,
//             endTime,
//         });
//     }

//     /* ───────────────── LIVE PUSH ───────────────── */

//     public sendToWebSocket(
//         virtualDeviceId: string,
//         payloads: any[],
//     ) {
//         if (!payloads.length) return;

//         const metricMap = this.subscriptions.get(virtualDeviceId);
//         if (!metricMap) return;

//         const grouped = this.groupByMetric(payloads);

//         grouped.forEach((metricPayloads, metricId) => {
//             const sockets = metricMap.get(metricId);
//             if (!sockets?.size) return;

//             const message = JSON.stringify(
//                 this.buildDto(metricId, metricPayloads),
//             );

//             sockets.forEach((ws) => {
//                 if (ws.readyState === ws.OPEN) {
//                     ws.send(message);
//                 }
//             });
//         });
//     }

//     /* ───────────────── HELPERS ───────────────── */

//     private groupByMetric(payloads: any[]) {
//         const map = new Map<string, any[]>();
//         payloads.forEach((p) => {
//             const metricId = p.metric?.metricsAttributeId;
//             if (!map.has(metricId)) map.set(metricId, []);
//             map.get(metricId)!.push(p);
//         });
//         return map;
//     }

//     private buildDto(metricId: string, metricPayloads: any[]) {
//         const first = metricPayloads[0];

//         return {
//             telemetryDevice: TelemetryDevice.createFromTelemetry(first),
//             metrics: metricPayloads.map((p) => getMetricDTO(p.metric)),
//             telemetryDisplayProperty: {
//                 metricsAttributeId: metricId,
//                 frequency: first.metric.frequency,
//                 displayName: metricId,
//                 unit: first.metric.unit,
//             },
//         };
//     }
// }
