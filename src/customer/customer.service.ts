import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entity/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto, FindCustomerDto } from './dto';
import { createLogger } from '../app_config/logger';
import { DUPLICATE_RECORD, KEY_SEPARATOR, NO_RECORD } from '../app_config/constants';

@Injectable()
export class CustomerService {
  private readonly logger = createLogger(CustomerService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) { }

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const fnName = this.create.name;
    const input = `Input : Create Object : ${JSON.stringify(createCustomerDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const existing = await this.repo.findOneBy({ phoneNumber: createCustomerDto.phoneNumber });
    if (existing != null) {
      this.logger.error(`${fnName} : ${DUPLICATE_RECORD} : Customer with phoneNumber ${existing.phoneNumber} already exists`);
      throw new Error(`${DUPLICATE_RECORD} : Customer with phoneNumber ${existing.phoneNumber} already exists`);
    } else {
      const customer = this.repo.create(createCustomerDto);
      this.logger.debug(`${fnName} : ToBeCreated Customer is : ${JSON.stringify(customer)}`);
      return await this.repo.save(customer);
    }
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const fnName = this.update.name;
    const input = `Input : Id : ${id}, Update object : ${JSON.stringify(updateCustomerDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const mergedCustomer = await this.repo.preload({ id, ...updateCustomerDto });
    if (mergedCustomer == null) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Customer id : ${id} not found`);
      throw new Error(`${NO_RECORD} : Customer id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : Merged Customer is : ${JSON.stringify(mergedCustomer)}`);
      return await this.repo.save(mergedCustomer);
    }
  }

  async findAll(searchCriteria?: FindCustomerDto): Promise<Customer[]> {
    const fnName = this.findAll.name;
    const input = `Input : Find Customer with searchCriteria : ${JSON.stringify(searchCriteria)}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const relations = ["district", "tickets"]
    return this.repo.find({ relations: relations, where: searchCriteria });
  }

  async findOneById(id: string): Promise<Customer> {
    const fnName = this.findOneById.name;
    const input = `Input : Find Customer by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const customer = await this.repo.findOne({ where: { id } });
    if (!customer) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Customer id : ${id} not found`);
      throw new Error(`${NO_RECORD} : Customer id : ${id} not found`);
    }
    return customer;
  }

  async findOne(searchCriteria: FindCustomerDto) {
    return this.repo.findOne({ where: searchCriteria });
  }

  async findByphoneNumber(phoneNumber: string) {
    const fnName = this.findByphoneNumber.name;
    const input = `Input : Find Customer by phoneNumber : ${phoneNumber}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.repo.findOne({ where: { phoneNumber } });

  }

  async findOrCreate(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const fnName = this.findOrCreate.name;
    const input = `Input : FindOrCreate Customer : ${JSON.stringify(createCustomerDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    let customer = await this.findByphoneNumber(createCustomerDto.phoneNumber!);
    if (!customer) {
      this.logger.debug(`${fnName} : Customer not found, creating new one`);
      customer = this.repo.create(createCustomerDto);
      customer = await this.repo.save(customer);
    } else {
      this.logger.debug(`${fnName} : Customer found, updating details`);
      if (createCustomerDto.name) customer.name = createCustomerDto.name;
      if (createCustomerDto.emailId) customer.emailId = createCustomerDto.emailId;
      if (createCustomerDto.address) customer.address = createCustomerDto.address;
      await this.repo.save(customer);
    }
    return customer;
  }

  async delete(id: string): Promise<any> {
    const fnName = this.delete.name;
    const input = `Input : Customer id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Customer id : ${id} not found`);
      throw new Error(`${NO_RECORD} : Customer id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : Customer id : ${id} deleted successfully`);
      return result;
    }
  }
}
