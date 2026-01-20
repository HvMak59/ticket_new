import { PartialType } from '@nestjs/mapped-types';
import { Role } from '../entity/role.entity';

export class UpdateRoleDto extends PartialType(Role) {}
