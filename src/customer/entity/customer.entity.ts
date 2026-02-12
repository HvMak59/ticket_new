import { KEY_SEPARATOR } from 'src/app_config/constants';
import { Ticket } from 'src/ticket/entity/ticket.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  OneToMany,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity()
export class Customer {
  constructor(customer?: Partial<Customer>) {
    Object.assign(this, customer);
  }

  @PrimaryColumn()
  id: string;

  setId() {
    this.id = this.getKey();
  }

  getKey() {
    return this.name + KEY_SEPARATOR + (this.emailId ?? '');
  }

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  emailId: string;

  @Column({ nullable: true })
  address: string;

  @Column()
  districtId: string;

  @Column()
  stateId: string;

  @Column()
  pinCode: string;

  @OneToMany(() => Ticket, (ticket) => ticket.customer)
  tickets: Ticket[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date | number;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;

  @DeleteDateColumn()
  deletedAt?: Date | number;

  @Column({ nullable: true })
  searchTerm: string;

  @BeforeInsert()
  @BeforeUpdate()
  setSearchTerm() {
    this.searchTerm = this.id + KEY_SEPARATOR + (this.emailId ?? '');
  }
}
