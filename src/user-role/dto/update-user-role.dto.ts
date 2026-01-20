import { PartialType } from '@nestjs/mapped-types';
import { UserRole } from '../entity/user-role.entity';

export class UpdateUserRoleDto extends PartialType(UserRole) {}
