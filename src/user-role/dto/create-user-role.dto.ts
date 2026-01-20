import { PartialType } from '@nestjs/mapped-types';
import { UserRole } from '../entity/user-role.entity';

export class CreateUserRoleDto extends PartialType(UserRole) {}
