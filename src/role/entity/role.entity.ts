import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { RoleType } from '../../common/enums';
import { UserRole } from '../../user-role/entity/user-role.entity';

@Entity()
export class Role {
  constructor(role?: Partial<Role>) {
    Object.assign(this, role ? role : {});
  }

  @PrimaryColumn({
    type: 'enum',
    enum: RoleType,
    enumName: 'roleTypeEnum'
  })
  id: RoleType;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => UserRole, (userRole) => userRole.role, { nullable: true })
  userRoles?: UserRole[];

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;
}
