import { PartialType } from '@nestjs/mapped-types';
import { Customer } from '../entity/customer.entity';

export class UpdateCustomerDto extends PartialType(Customer) {}
