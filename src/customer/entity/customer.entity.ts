import { KEY_SEPARATOR } from 'src/app_config/constants';
import { CustomerUser } from 'src/customer-user/entities/customer-user.entity';
import { District } from 'src/district/entities/district.entity';
import { Ticket } from 'src/ticket/entity/ticket.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  OneToMany,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Customer {
  constructor(customer?: Partial<Customer>) {
    Object.assign(this, customer);
  }

  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  setId() {
    this.id = this.getKey();
  }

  getKey() {
    return this.name + KEY_SEPARATOR + (this.emailId ?? '');
  }

  @Column()
  name: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  emailId: string;

  @Column({ nullable: true })
  address: string;

  // AuditDateTime? auditDateTime;

  @Column()
  districtId: string;

  @ManyToOne(() => District, (district) => district.customers)
  district: District;

  @Column()
  pinCode: string;

  // @OneToMany(() => User, (user) => user.customer)
  // users: User[];

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
