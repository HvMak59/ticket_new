import { KEY_SEPARATOR } from 'src/app_config/constants';
import { DeviceType } from 'src/device-type/entity/device-type.entity';
import { Ticket } from 'src/ticket/entity/ticket.entity';
import {
    Entity,
    Column,
    ManyToOne,
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToMany,
} from 'typeorm';

@Entity()
export class Issue {
    constructor(issue?: Partial<Issue>) {
        Object.assign(this, issue);
    }

    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description?: string;

    @Column()
    deviceTypeId: string;

    @ManyToOne(() => DeviceType, (deviceType) => deviceType.issues)
    deviceType: DeviceType;

    @OneToMany(() => Ticket, (ticket) => ticket.issue)
    tickets: Ticket[];

    @Column({ default: 'System' })
    createdBy: string;

    @Column({ nullable: true })
    updatedBy?: string;

    @Column({ nullable: true })
    deletedBy?: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    @Column({ nullable: true })
    searchTerm?: string;

    @BeforeInsert()
    @BeforeUpdate()
    setSearchTerm() {
        this.searchTerm = this.name + KEY_SEPARATOR + (this.deviceTypeId ?? this.deviceType.id);
    }
}
