import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryColumn,
  BeforeInsert,
} from 'typeorm';
import { Ticket } from './ticket.entity';
import { User } from '../../user/entity/user.entity';
import { KEY_SEPARATOR } from 'src/app_config/constants';

@Entity()
export class TicketActivity {
  constructor(activity?: Partial<TicketActivity>) {
    Object.assign(this, activity);
  }

  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  setId() {
    this.id = this.getKey();
  }

  @Column()
  ticketId: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  performedBy: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // @ManyToOne(() => Ticket, (ticket) => ticket.activities, { onDelete: 'CASCADE' })
  // ticket: Ticket;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  performer: User;

  getKey() {
    return this.ticketId + KEY_SEPARATOR + this.performedBy;
  }
}
