import { FindOptionsWhere } from 'typeorm';
import { UserRole } from '../entity/user-role.entity';

export interface FindUserRoleDto extends FindOptionsWhere<UserRole> {}
