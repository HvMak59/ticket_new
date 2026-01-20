import { FindOptionsWhere } from 'typeorm';
import { Role } from '../entity/role.entity';

export interface FindRoleDto extends FindOptionsWhere<Role> {}
