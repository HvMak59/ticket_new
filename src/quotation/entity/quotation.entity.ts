import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Ticket } from '../../ticket/entity/ticket.entity';
import { QuotationStatus } from '../../common/enums';

export { QuotationStatus } from '../../common/enums';

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

@Entity()
export class Quotation {
  constructor(quotation?: Partial<Quotation>) {
    Object.assign(this, quotation);
  }

  @PrimaryColumn()
  id: string;

  @Column()
  ticketId: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.quotations)
  ticket: Ticket;

  @Column({ nullable: true })
  pdfPath: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cost: number;

  @Column({ type: 'jsonb', default: [] })
  lineItems: LineItem[];

  @Column({ type: 'enum', enum: QuotationStatus, default: QuotationStatus.PENDING })
  status: QuotationStatus;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ type: 'timestamptz', nullable: true })
  respondedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}




// @Entity()
// export class Quotation {
//   @PrimaryColumn()
//   id: string;

//   @Column()
//   ticketId: string;

//   @ManyToOne(() => Ticket, (ticket) => ticket.quotations)
//   ticket: Ticket;

//   @Column()
//   pdfPath: string;

//   @Column('decimal', { precision: 10, scale: 2 })
//   cost: number;

//   @Column({ type: 'enum', enum: QuotationStatus, default: QuotationStatus.DRAFT })
//   status: QuotationStatus;

//   @Column({ default: 1 })
//   version: number;

//   @Column({ nullable: true })
//   parentQuotationId: string;

//   @Column()
//   createdBy: string;

//   @Column({ nullable: true })
//   sentBy: string;

//   @Column({ type: 'timestamptz', nullable: true })
//   sentAt: Date;

//   @Column({ type: 'timestamptz', nullable: true })
//   customerRespondedAt: Date;

//   @Column({ nullable: true })
//   customerResponseNote: string;

//   @CreateDateColumn({ type: 'timestamptz' })
//   createdAt: Date;

//   @UpdateDateColumn({ type: 'timestamptz' })
//   updatedAt: Date;
// }
