import { PartialType } from '@nestjs/mapped-types';
import { Role } from '../entity/role.entity';

export class CreateRoleDto extends PartialType(Role) {}
