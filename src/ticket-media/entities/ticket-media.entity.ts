import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Ticket } from '../../ticket/entity/ticket.entity';
import { FileType } from '../../common/enums';

// Re-export for backward compatibility
export { FileType } from '../../common/enums';

@Entity()
export class TicketMedia {
  constructor(media?: Partial<TicketMedia>) {
    Object.assign(this, media);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @Column()
  // ticketId: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.ticketMedias, {
    onDelete: 'CASCADE',
  })
  ticket: Ticket;

  @Column()
  filePath: string;

  @Column({ type: 'enum', enum: FileType })
  fileType: FileType;

  @Column({ nullable: true })
  fileName: string;

  @Column()
  mimeType: string;

  @Column()
  size: number; // bytes

  @Column({ default: false })
  isResolutionProof: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
