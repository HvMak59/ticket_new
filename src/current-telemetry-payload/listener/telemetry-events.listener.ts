import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CurrentTelemetryPayload } from '../entities/current-telemetry-payload.entity';
import { TelemetryGateway } from 'src/websockets/old_telemetry.gateway';
import { CurrentTelemetryPayloadService } from '../current-telemetry-payload.service';

@Injectable()
export class TelemetryEventsListener {
    constructor(
        private readonly telemetryGateway: TelemetryGateway,
        private readonly currentTelemetryPayloadService: CurrentTelemetryPayloadService,
    ) { }

    @OnEvent('telemetry.inserted')
    async handleTelemetryInserted(payload: CurrentTelemetryPayload) {
        console.log("In Listener")
        const virtualDeviceId = payload.virtualDeviceId;

        if (!virtualDeviceId) return;

        const r = await this.currentTelemetryPayloadService.findById(payload.id);
        this.telemetryGateway.sendToWebSocket(
            virtualDeviceId,
            // [payload],
            r,
        );
        // 
    }
}
