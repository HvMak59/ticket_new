import { PartialType } from '@nestjs/mapped-types';
import { District } from '../entities/district.entity';

export class CreateDistrictDto extends PartialType(District) {}
