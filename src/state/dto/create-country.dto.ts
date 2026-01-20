import { PartialType } from '@nestjs/mapped-types';
import { Country } from '../entities/country.entity';

export class CreateCountryDto extends PartialType(Country) {}
