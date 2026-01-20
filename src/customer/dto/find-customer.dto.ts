import { FindOptionsWhere } from 'typeorm';
import { Customer } from '../entity/customer.entity';

export interface FindCustomerDto extends FindOptionsWhere<Customer> {}
