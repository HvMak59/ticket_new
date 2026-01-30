import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entity/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto, FindCustomerDto } from './dto';
import { createLogger } from '../app_config/logger';
import { DUPLICATE_RECORD, KEY_SEPARATOR, NO_RECORD } from '../app_config/constants';
import serviceConfig from '../app_config/service.config.json';
import { RoleType } from 'src/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CustomerService {
  private readonly logger = createLogger(CustomerService.name);
  private readonly relations = serviceConfig.customer.relations;

  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
    private readonly jwtService: JwtService,
  ) { }

  async create(createCustomerDto: CreateCustomerDto) {
    const fnName = this.create.name;
    const input = `Input : Create Object : ${JSON.stringify(createCustomerDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const existing = await this.repo.findOneBy({ emailId: createCustomerDto.emailId });

    if (existing != null) {
      this.logger.error(`${fnName} : ${DUPLICATE_RECORD} : Customer already exists`);
      throw new Error(`${DUPLICATE_RECORD} : Customer already exists`);
    } else {
      const customer = this.repo.create(createCustomerDto);
      this.logger.debug(`${fnName} : ToBeCreated Customer is : ${JSON.stringify(customer)}`);
      const savedCustomer = await this.repo.save(customer);

      if (savedCustomer) {
        const payload = {
          username: customer.name,
          sub: customer.id,
          role: RoleType.CUSTOMER
        }
        return this.jwtService.sign(payload);
      }
    }
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const fnName = this.update.name;
    const input = `Input : Id : ${id}, Update object : ${JSON.stringify(updateCustomerDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (id == null) {
      throw new Error('Customer id is not available');
    }
    else if (updateCustomerDto.id == null) {
      updateCustomerDto.id = id;
    }
    else if (updateCustomerDto.id != id) {
      throw new Error('Customer id does not match with update Customer object');
    }

    const mergedCustomer = await this.repo.preload(updateCustomerDto);
    if (mergedCustomer == null) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Customer id : ${id} not found`);
      throw new Error(`${NO_RECORD} : Customer id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : Merged Customer is : ${JSON.stringify(mergedCustomer)}`);
      return await this.repo.save(mergedCustomer);
    }
  }

  async findAll(searchCriteria?: FindCustomerDto, relationsRequired?: boolean) {
    const fnName = this.findAll.name;
    const input = `Input : Find Customer with searchCriteria : ${JSON.stringify(searchCriteria)}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const relations = relationsRequired ? this.relations : [];
    return this.repo.find({ where: searchCriteria, relations: relations });
  }

  async findOneById(id: string) {
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

  // async findByEmailId(emailId: string) {
  //   const fnName = this.findByEmailId.name;
  //   const input = `Input : Find Customer by emailId : ${emailId}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   return this.repo.findOne({ where: { emailId } });

  // }

  // async findOrCreate(createCustomerDto: CreateCustomerDto): Promise<Customer> {
  //   const fnName = this.findOrCreate.name;
  //   const input = `Input : FindOrCreate Customer : ${JSON.stringify(createCustomerDto)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   let customer = await this.findByEmailId(createCustomerDto.emailId!);
  //   if (!customer) {
  //     this.logger.debug(`${fnName} : Customer not found, creating new one`);
  //     customer = this.repo.create(createCustomerDto);
  //     customer = await this.repo.save(customer);
  //   } else {
  //     this.logger.debug(`${fnName} : Customer found, updating details`);
  //     if (createCustomerDto.name) customer.name = createCustomerDto.name;
  //     if (createCustomerDto.emailId) customer.emailId = createCustomerDto.emailId;
  //     if (createCustomerDto.address) customer.address = createCustomerDto.address;
  //     await this.repo.save(customer);
  //   }
  //   return customer;
  // }

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

  async softDelete(id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : SoftDelete Customer : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    return await this.repo.softDelete(id);
  }

  async restore(id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : Restore Customer : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const result = await this.repo.restore(id);
    if (result.affected === 0) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : Customer id : ${id} not found`,
      );
      throw new Error(`${NO_RECORD} : Customer id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} Customer id : ${id} restored successfully`);
      let restored = await this.findOneById(id);
      restored!.deletedBy = undefined;
      this.repo.save(restored!);
      return restored;
    }
  }
}
