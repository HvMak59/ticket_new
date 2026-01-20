
import { KEY_SEPARATOR } from 'src/app_config/constants';
import { State } from '../../state/entities/state.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Customer } from 'src/customer/entity/customer.entity';

@Entity()
export class District {
  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  setId() {
    this.id = this.name + KEY_SEPARATOR + this.stateId;
  }

  @Column()
  name: string;

  @ManyToOne(() => State, (state) => state.districts)
  state: State;

  @OneToMany(() => Customer, (customer) => customer.district)
  customers: Customer[];

  @Column()
  stateId: string;

  // @Column(() => AuditDateTime)
  // auditDateTime: AuditDateTime;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;
}
