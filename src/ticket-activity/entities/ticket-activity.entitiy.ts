import {
    Entity,
    Column,
    CreateDateColumn,
    ManyToOne,
    PrimaryColumn,
    BeforeInsert,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { TicketActivityAction } from 'src/common';


@Entity('ticket_activities')
export class TicketActivity {
    constructor(activity?: Partial<TicketActivity>) {
        Object.assign(this, activity);
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    ticketId: string;

    @Column({
        type: 'enum',
        enum: TicketActivityAction
    })
    action: TicketActivityAction;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column()
    performedById: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    performer: User;

    @CreateDateColumn({ type: 'timestamptz' })
    performedAt: Date;
}

