import { District } from '../../district/entities/district.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Country } from './country.entity';
import { KEY_SEPARATOR } from 'src/app_config/constants';

@Entity()
export class State {
  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  setID() {
    this.id = this.getPrimaryKey();
  }

  @Column()
  stateId: string;

  @Column()
  name: string;

  // @ManyToOne(() => Country, (country) => country.states)
  // country: Country;

  @Column()
  countryId: string;

  @OneToMany(() => District, (district) => district.state, { nullable: true })
  districts?: District[];

  // @Column(() => AuditDateTime)
  // auditDateTime: AuditDateTime;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;

  getPrimaryKey() {
    return this.stateId + KEY_SEPARATOR + this.countryId;
  }
}
