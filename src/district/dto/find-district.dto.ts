import { FindOptionsWhere } from 'typeorm';
import { District } from '../entities/district.entity';

export interface FindDistrictDto extends FindOptionsWhere<District> {}
