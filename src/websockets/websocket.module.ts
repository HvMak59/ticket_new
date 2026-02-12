import { Module } from '@nestjs/common';
import { TelemetryGateway } from './old_telemetry.gateway';
import { TelemetryPayloadModule } from 'src/telemetry-payload/telemetry-payload.module';
import { TelemetryEventsListener } from 'src/current-telemetry-payload/listener/telemetry-events.listener';
import { CurrentTelemetryPayloadModule } from 'src/current-telemetry-payload/current-telemetry-payload.module';

@Module({
    imports: [TelemetryPayloadModule, CurrentTelemetryPayloadModule],
    providers: [TelemetryGateway, TelemetryEventsListener]
})
export class WebSocketModule { }


