import { TicketStatus } from "src/common";
import { Customer } from "src/customer/entity/customer.entity";
import { Device } from "src/device/entity/device.entity";
import { User } from "src/user/entity/user.entity";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { TicketMedia } from "../../ticket-media/entities/ticket-media.entity";
import { KEY_SEPARATOR } from "src/app_config/constants";
import { Issue } from "../../issue/entities/issue.entity";
import { Quotation } from "src/quotation/entity/quotation.entity";

@Entity()
export class Ticket {
  @PrimaryColumn()
  id: string;

  @Column()
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.tickets)
  customer: Customer;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column({ nullable: true })
  deviceId: string;

  @ManyToOne(() => Device, { nullable: true })
  device: Device;

  @Column({ nullable: true })
  issueId: string;

  @ManyToOne(() => Issue, (issue) => issue.tickets, { nullable: true })
  issue: Issue;

  // for other values

  // Issue
  // @Column({ default: false })
  // isOtherIssue?: boolean;

  @Column({ nullable: true })
  otherIssueId?: string;

  @Column({ nullable: true })
  otherIssueDesc?: string;

  // deviceManufacturer
  // @Column({ nullable: true })
  // isOtherManufacturer?: boolean;

  @Column({ nullable: true })
  otherManufacturerName?: string;

  // deviceModel
  // @Column({ nullable: true })
  // isOtherModel?: boolean;

  @Column({ nullable: true })
  otherDeviceModelName?: string;

  @OneToMany(() => Quotation, (quotation) => quotation.ticket)
  quotations: Quotation[];

  @Column({ type: 'timestamptz', nullable: true })
  dateOfPurchase?: Date | number

  @OneToMany(() => TicketMedia, (ticketMedia) => ticketMedia.ticket, { cascade: true })
  ticketMedias: TicketMedia[];

  @Column({ nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, { nullable: true })
  assignedTo: User;

  @Column({ nullable: true })
  assignedById: string;

  @ManyToOne(() => User, { nullable: true })
  assignedBy: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ nullable: true })
  deletedBy: string;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date;

  @Column({ nullable: true })
  searchTerm: string;

  @BeforeInsert()
  @BeforeUpdate()
  setSearchTerm() {
    this.searchTerm = this.customerId +
      KEY_SEPARATOR +
      (this.deviceId ?? this.device?.id) +
      KEY_SEPARATOR +
      (this.issueId ?? this.issue?.id);
  }
}









// @Entity()
// export class Ticket {
//   @PrimaryColumn()
//   id: string;

//   /* ---------------- CUSTOMER ---------------- */

//   @Column()
//   customerId: string;

//   @ManyToOne(() => Customer, (customer) => customer.tickets)
//   customer: Customer;

//   /* ---------------- DEVICE CONTEXT ---------------- */

//   @Column({ nullable: true })
//   deviceId?: string;

//   @ManyToOne(() => Device, { nullable: true })
//   device?: Device;

//   @Column({
//     type: 'enum',
//     enum: DeviceContextType,
//     default: DeviceContextType.UNKNOWN,
//   })
//   deviceContextType: DeviceContextType;

//   // Used ONLY if device is not known
//   @Column({ nullable: true })
//   otherManufacturerName?: string;

//   @Column({ nullable: true })
//   otherDeviceModelName?: string;

//   /* ---------------- ISSUE ---------------- */

//   @Column({ nullable: true })
//   issueId?: string;

//   @ManyToOne(() => Issue, (issue) => issue.tickets, { nullable: true })
//   issue?: Issue;

//   @Column({ nullable: true })
//   otherIssueDesc?: string;

//   /* ---------------- ASSIGNMENT ---------------- */

//   @Column({ nullable: true })
//   assignedToId?: string;

//   @ManyToOne(() => User, { nullable: true })
//   assignedTo?: User;

//   @Column({ nullable: true })
//   assignedById?: string;

//   @ManyToOne(() => User, { nullable: true })
//   assignedBy?: User;

//   /* ---------------- META ---------------- */

//   @Column({
//     type: 'enum',
//     enum: TicketStatus,
//     default: TicketStatus.OPEN,
//   })
//   status: TicketStatus;

//   @CreateDateColumn({ type: 'timestamptz' })
//   createdAt: Date;

//   @Column({ default: 'System' })
//   createdBy: string;

//   @Column({ nullable: true })
//   updatedBy?: string;

//   @DeleteDateColumn({ type: 'timestamptz' })
//   deletedAt?: Date;

//   @Column({ nullable: true })
//   searchTerm?: string;

//   /* ---------------- HOOK ---------------- */

//   @BeforeInsert()
//   @BeforeUpdate()
//   setSearchTerm() {
//     this.searchTerm = [
//       this.customerId ?? '',
//       this.deviceId ?? '',
//       this.issueId ?? '',
//       this.otherManufacturerName ?? '',
//       this.otherDeviceModelName ?? '',
//     ].join(KEY_SEPARATOR);
//   }
// }
