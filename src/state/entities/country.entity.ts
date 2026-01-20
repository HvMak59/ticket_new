import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { State } from './state.entity';

@Entity()
export class Country {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  // @OneToMany(() => State, (state) => state.country, { nullable: true })
  // states?: State[];

  // @Column(() => AuditDateTime)
  // auditDateTime: AuditDateTime;

  //

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;
}
