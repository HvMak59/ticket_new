import { PartialType } from '@nestjs/mapped-types';
import { Customer } from '../entity/customer.entity';

export class CreateCustomerDto extends PartialType(Customer) {}
