import { CurrentTelemetryPayload } from "src/current-telemetry-payload/entities/current-telemetry-payload.entity";
import { TelemetryPayload } from "src/telemetry-payload/entities/telemetry-payload.entity";
import { Entity, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class VirtualDevice {
    @PrimaryColumn()
    id: string

    @OneToMany(
        () => TelemetryPayload,
        (payload) => payload.virtualDevice,
    )
    telemetryPayloads: TelemetryPayload[];

    @OneToMany(
        () => TelemetryPayload,
        (payload) => payload.virtualDevice,
    )
    currentTelemetryPayloads: CurrentTelemetryPayload[];

}