import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Ticket } from './ticket.entity';
import { FileType } from '../../common/enums';

// Re-export for backward compatibility
export { FileType } from '../../common/enums';

@Entity()
export class TicketMedia {
  constructor(media?: Partial<TicketMedia>) {
    Object.assign(this, media);
  }

  @PrimaryColumn()
  id: string;

  @Column()
  ticketId: string;

  @Column()
  filePath: string;

  @Column({ type: 'enum', enum: FileType })
  fileType: FileType;

  @Column({ nullable: true })
  fileName: string;

  @Column({ default: false })
  isResolutionProof: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Ticket, (ticket) => ticket.ticketMedia)
  ticket: Ticket;
}
