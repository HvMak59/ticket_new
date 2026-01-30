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
import { Server, WebSocket } from 'ws';

@WebSocketGateway({ cors: { origin: '*' } })
export class TelemetryGateway {
    @WebSocketServer()
    server: Server;

    // Structure: vid -> metricId -> Set of clients
    private subscriptions = new Map<string, Map<string, Set<WebSocket>>>();

    // Each client can subscribe to multiple vids, but only one metricId
    private clientSubMap = new Map<WebSocket, { vids: string[]; metricId: string }>();

    handleConnection(client: WebSocket) {
        console.log(`Client connected`);

        client.on('message', (raw) => {
            try {
                console.log("Raw message:", raw.toString());
                const msg = JSON.parse(raw.toString());

                const vids: string[] = Array.isArray(msg.virtualDeviceIds)
                    ? msg.virtualDeviceIds
                    : msg.virtualDeviceId
                        ? [msg.virtualDeviceId]
                        : [];

                const metricAttrId = msg.metricsAttributeId;

                if (!vids.length || !metricAttrId) {
                    console.error('Invalid subscription message: missing vids or metric');
                    return;
                }

                this.subscribeClient(client, vids, metricAttrId);
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

    private subscribeClient(client: WebSocket, vids: string[], metricAttrId: string) {
        // Cleanup old subscriptions if client re-subscribes
        const old = this.clientSubMap.get(client);
        if (old) {
            for (const oldVid of old.vids) {
                const oldMap = this.subscriptions.get(oldVid);
                if (oldMap) {
                    const clients = oldMap.get(old.metricId);
                    clients?.delete(client);
                    if (clients?.size === 0) oldMap.delete(old.metricId);
                    if (oldMap.size === 0) this.subscriptions.delete(oldVid);
                }
            }
        }

        // Add new subscriptions
        for (const vid of vids) {
            if (!this.subscriptions.has(vid)) {
                this.subscriptions.set(vid, new Map());
            }
            const metricMap = this.subscriptions.get(vid)!;

            if (!metricMap.has(metricAttrId)) {
                metricMap.set(metricAttrId, new Set());
            }
            metricMap.get(metricAttrId)!.add(client);

            console.log(`Client subscribed to: ${vid}:${metricAttrId}`);
        }

        this.clientSubMap.set(client, { vids, metricId: metricAttrId });
    }

    private cleanupClient(client: WebSocket) {
        const sub = this.clientSubMap.get(client);
        if (!sub) return;

        for (const vid of sub.vids) {
            const metricMap = this.subscriptions.get(vid);
            if (!metricMap) continue;

            const clients = metricMap.get(sub.metricId);
            clients?.delete(client);

            if (clients?.size === 0) metricMap.delete(sub.metricId);
            if (metricMap.size === 0) this.subscriptions.delete(vid);
        }
    }

    // public sendToWebSocket(virtualDeviceId: string, devicePayloads: any[]) {
    //     if (!devicePayloads.length) return;

    //     const metricMap = this.subscriptions.get(virtualDeviceId);
    //     if (!metricMap) return;

    //     const groupedByMetric = new Map<string, any[]>();

    //     for (const payload of devicePayloads) {
    //         const metricId = payload.metric?.metricsAttributeId;
    //         if (!groupedByMetric.has(metricId)) {
    //             groupedByMetric.set(metricId, []);
    //         }
    //         groupedByMetric.get(metricId)!.push(payload);
    //     }

    //     for (const [metricId, metricPayloads] of groupedByMetric.entries()) {
    //         const sockets = metricMap.get(metricId);
    //         if (!sockets || sockets.size === 0) continue;

    //         const telemetryDevice = TelemetryDevice.createFromTelemetry(metricPayloads[0]);
    //         const frequency = metricPayloads[0].metric.frequency;
    //         const metrics = metricPayloads.map((rcvd) => getMetricDTO(rcvd.metric));

    //         const telemetryDisplayProperty: TelemetryDisplayProperty = {
    //             metricsAttributeId: metricId,
    //             frequency,
    //             displayName: metricId,
    //             unit: metricPayloads[0].metric.unit,
    //         };

    //         const dto = new TelemetryPayloadDto(
    //             telemetryDevice,
    //             metrics,
    //             telemetryDisplayProperty,
    //         );

    //         const message = JSON.stringify(dto);
    //         console.log(`Sending to ${virtualDeviceId}:${metricId} -> ${message}`);

    //         sockets.forEach((ws) => {
    //             if (ws.readyState === ws.OPEN) {
    //                 ws.send(message);
    //             }
    //         });
    //     }
    // }
}


// import {
//   WebSocketGateway,
//   WebSocketServer,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import { Server } from 'ws';
// import type { WebSocket } from 'ws';

// @WebSocketGateway({ cors: { origin: '*' } })
// export class TelemetryGateway
//   implements OnGatewayConnection, OnGatewayDisconnect
// {
//   @WebSocketServer()
//   server: Server;

//   /**
//    * subscriptions = {
//    *   vid1: {
//    *     voltage: Set<WebSocket>,
//    *     power: Set<WebSocket>
//    *   }
//    * }
//    */
//   private subscriptions = new Map<string, Map<string, Set<WebSocket>>>();

//   // client -> vid
//   private clientVidMap = new Map<WebSocket, string>();

//   handleConnection(client: WebSocket, request: any) {
//     try {
//       const url = request?.url ?? '';
//       const query = url.includes('?') ? url.split('?')[1] : '';
//       const params = new URLSearchParams(query);
//       const vid = params.get('virtualDeviceId');

//       if (!vid) {
//         console.error('Client connected without virtualDeviceId. Closing.');
//         client.close();
//         return;
//       }

//       this.clientVidMap.set(client, vid);
//       console.log(`Client connected for vid=${vid}`);

//       client.on('message', (raw) => {
//         const metricId = raw.toString().trim();
//         if (!metricId) return;

//         this.subscribeClient(client, metricId);
//       });
//     } catch (err) {
//       console.error('Error during WS connection', err);
//       client.close();
//     }
//   }

//   handleDisconnect(client: WebSocket) {
//     const vid = this.clientVidMap.get(client);
//     console.log(`Client for vid=${vid} disconnected`);
//     this.cleanupClient(client);
//     this.clientVidMap.delete(client);
//   }

//   /**
//    * Each client can subscribe to ONLY ONE metric at a time
//    */
//   private subscribeClient(client: WebSocket, metric: string) {
//     const vid = this.clientVidMap.get(client);
//     if (!vid) return;

//     if (!this.subscriptions.has(vid)) {
//       this.subscriptions.set(vid, new Map());
//     }

//     const metricMap = this.subscriptions.get(vid)!;

//     // Remove client from all previous metrics for this VID
//     for (const [m, clients] of metricMap) {
//       if (clients.delete(client) && clients.size === 0) {
//         metricMap.delete(m);
//       }
//     }

//     // Add to new metric
//     if (!metricMap.has(metric)) {
//       metricMap.set(metric, new Set());
//     }

//     metricMap.get(metric)!.add(client);

//     console.log(`Client subscribed to ${vid}:${metric}`);
//   }

//   /**
//    * Cleanup client from all vids & metrics
//    */
//   private cleanupClient(client: WebSocket) {
//     for (const [vid, metricMap] of this.subscriptions) {
//       for (const [metric, clients] of metricMap) {
//         if (clients.delete(client) && clients.size === 0) {
//           metricMap.delete(metric);
//         }
//       }
//       if (metricMap.size === 0) {
//         this.subscriptions.delete(vid);
//       }
//     }
//   }

//   /**
//    * Push telemetry to subscribed clients
//    */
// //   public sendToWebSocket(virtualDeviceId: string, devicePayloads: any[]) {
// //     if (!devicePayloads?.length) return;

// //     const metricMap = this.subscriptions.get(virtualDeviceId);
// //     if (!metricMap) return;

// //     // Group payloads by metric
// //     const groupedByMetric = new Map<string, any[]>();

// //     for (const payload of devicePayloads) {
// //       const metricId = payload?.metric?.metricsAttributeId;
// //       if (!metricId) continue;

// //       if (!groupedByMetric.has(metricId)) {
// //         groupedByMetric.set(metricId, []);
// //       }
// //       groupedByMetric.get(metricId)!.push(payload);
// //     }

// //     for (const [metricId, metricPayloads] of groupedByMetric) {
// //       const sockets = metricMap.get(metricId);
// //       if (!sockets?.size) continue;

// //       const telemetryDevice =
// //         TelemetryDevice.createFromTelemetry(metricPayloads[0]);
// //       const frequency = metricPayloads[0].metric.frequency;
// //       const metrics = metricPayloads.map((rcvd) =>
// //         getMetricDTO(rcvd.metric),
// //       );

// //       const telemetryDisplayProperty: TelemetryDisplayProperty = {
// //         metricsAttributeId: metricId,
// //         frequency,
// //         displayName: metricId,
// //         unit: metricPayloads[0].metric.unit,
// //       };

// //       const dto = new TelemetryPayloadDto(
// //         telemetryDevice,
// //         metrics,
// //         telemetryDisplayProperty,
// //       );

// //       const message = JSON.stringify(dto);

// //       console.log(
// //         `Sending to ${virtualDeviceId}:${metricId} (${sockets.size} clients)`,
// //       );

// //       sockets.forEach((ws) => {
// //         if (ws.readyState === ws.OPEN) {
// //           ws.send(message);
// //         }
// //       });
// //     }
// //   }
// }
