import {
  Entity,
  Column,
  ManyToOne,
  PrimaryColumn,
  DeleteDateColumn,
  BeforeInsert,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Role } from '../../role/entity/role.entity';
import { RoleType } from '../../common/enums';
import { KEY_SEPARATOR } from '../../app_config/constants';


@Entity()
export class UserRole {
  constructor(userRole?: Partial<UserRole>) {
    Object.assign(this, userRole ? userRole : {});
  }

  @PrimaryColumn()
  id: string;

  @ManyToOne(() => User, (user) => user.userRoles)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Role, (role) => role.userRoles)
  role: Role;

  @Column({
    type: 'enum',
    enum: RoleType,
    enumName: 'roleTypeEnum'
  })
  roleId: RoleType;

  @Column({ default: 'System' })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;

  @DeleteDateColumn()
  deletedAt?: Date;

  @BeforeInsert()
  setId() {
    this.id = this.getKey();
  }

  getKey() {
    return this.userId + KEY_SEPARATOR + this.roleId;
  }
}


