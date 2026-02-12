import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ticket } from '../../ticket/entity/ticket.entity';
// import { QuotationStatus } from '../../common/enums';
import { User } from 'src/user/entity/user.entity';
import { Customer } from 'src/customer/entity/customer.entity';
import { QuotationStatus } from 'src/common';

// export { QuotationStatus } from '../../common/enums';

// export interface LineItem {
//   description: string;
//   quantity: number;
//   unitPrice: number;
//   total: number;
// }

// @Entity()
// export class Quotation {
//   constructor(quotation?: Partial<Quotation>) {
//     Object.assign(this, quotation);
//   }

//   @PrimaryColumn()
//   id: string;

//   @Column()
//   ticketId: string;

//   @ManyToOne(() => Ticket, (ticket) => ticket.quotations)
//   ticket: Ticket;

//   @Column({ nullable: true })
//   pdfPath: string;

//   @Column('decimal', { precision: 10, scale: 2 })
//   cost: number;

//   @Column({ type: 'jsonb', default: [] })
//   lineItems: LineItem[];

//   @Column({ type: 'enum', enum: QuotationStatus, default: QuotationStatus.PENDING })
//   status: QuotationStatus;

//   @Column({ nullable: true })
//   createdBy: string;

//   @Column({ type: 'timestamptz', nullable: true })
//   respondedAt: Date;

//   @CreateDateColumn({ type: 'timestamptz' })
//   createdAt: Date;

//   @UpdateDateColumn({ type: 'timestamptz' })
//   updatedAt: Date;
// }


// @Entity()
// export class Quotation {
//   constructor(data?: Partial<Quotation>) {
//     Object.assign(this, data);
//   }

//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column()
//   ticketId: string;

//   @ManyToOne(() => Ticket, (ticket) => ticket.quotations, { onDelete: 'CASCADE' })
//   ticket: Ticket;

//   @Column()
//   pdfPath: string;

//   @Column({ nullable: true })
//   pdfName: string;

//   @Column({
//     type: 'enum',
//     enum: QuotationStatus,
//     default: QuotationStatus.DRAFT,
//   })
//   status: QuotationStatus;

//   @Column({ type: 'int', default: 1 })
//   version: number;

//   @Column({ nullable: true })
//   sentById: string;

//   @ManyToOne(() => User, { nullable: true })
//   sentBy: User;

//   @Column({ type: 'timestamptz', nullable: true })
//   sentAt: Date;

//   @Column({ nullable: true })
//   respondedById: string;

//   @ManyToOne(() => Customer, { nullable: true })
//   respondedBy: Customer;

//   @Column({ type: 'timestamptz', nullable: true })
//   respondedAt: Date;

//   @Column({ type: 'text', nullable: true })
//   rejectionReason: string;

//   @Column({ type: 'text', nullable: true })
//   changeRequestNote: string;

//   @CreateDateColumn({ type: 'timestamptz' })
//   createdAt: Date;

//   @UpdateDateColumn({ type: 'timestamptz' })
//   updatedAt: Date;
// }

@Entity()
export class Quotation {
  constructor(data?: Partial<Quotation>) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ticketId: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.quotations, {
    onDelete: 'CASCADE',
  })
  ticket: Ticket;

  @Column({ nullable: true })
  filePath: string;

  @Column({ nullable: true })
  fileName: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({
    type: 'enum',
    enum: QuotationStatus,
    default: QuotationStatus.DRAFT,
  })
  status: QuotationStatus;

  @Column({ nullable: true })
  sentById: string;

  @ManyToOne(() => User, { nullable: true })
  sentBy: User;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt: Date;

  @Column({ nullable: true })
  respondedById: string;

  @ManyToOne(() => Customer, { nullable: true })
  respondedBy: Customer;

  @Column({ type: 'timestamptz', nullable: true })
  respondedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'text', nullable: true })
  changeRequestNote: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}





export const QUOTATION_TRANSITIONS = {
  MANAGER: {
    UPLOAD: ['DRAFT', 'CHANGE_REQUESTED'],
    SEND: ['DRAFT', 'REVISED'],
    REVISE: ['CHANGE_REQUESTED'],
  },
  CUSTOMER: {
    ACCEPT: ['SENT', 'REVISED'],
    REJECT: ['SENT', 'REVISED'],
    REQUEST_CHANGE: ['SENT', 'REVISED'],
  },
} as const;


