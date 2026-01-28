import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  PrimaryColumn,
  ManyToOne,
} from 'typeorm';
import { UserRole } from '../../user-role/entity/user-role.entity';
import { KEY_SEPARATOR } from '../../app_config/constants';
import { CustomerUser } from 'src/customer-user/entities/customer-user.entity';
import { Customer } from 'src/customer/entity/customer.entity';

@Entity()
export class User {
  constructor(user?: Partial<User>) {
    Object.assign(this, user ? user : {});
  }

  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, unique: true })
  emailId: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  phone: string;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  // @OneToMany(() => CustomerUser, (cu) => cu.user)
  // customerUsers: CustomerUser[];

  // @Column({ nullable: true })
  // customerId: string;

  // @ManyToOne(() => Customer, (customer) => customer.users)
  // customer: Customer;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ nullable: true })
  deletedBy: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ nullable: true })
  searchTerm: string;

  @BeforeInsert()
  @BeforeUpdate()
  setSearchTerm() {
    this.searchTerm = this.id + KEY_SEPARATOR + (this.emailId ?? '');
  }
}
