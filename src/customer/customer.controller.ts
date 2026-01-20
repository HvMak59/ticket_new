import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto, UpdateCustomerDto, FindCustomerDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles, RoleType } from '../common';
import { UserId } from '../utils/req-user-id-decorator';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from '../app_config/constants';

@Controller('customer')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  private readonly logger = createLogger(CustomerController.name);

  constructor(private readonly customerService: CustomerService) { }

  @Post()
  async create(@UserId() userId: string, @Body() createCustomerDto: CreateCustomerDto) {
    const fnName = this.create.name;
    const input = `Input : ${JSON.stringify(createCustomerDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      createCustomerDto.createdBy = userId;
      this.logger.debug(`${fnName} : Calling Create service`);
      return await this.customerService.create(createCustomerDto);
    }
  }

  @Patch()
  // @UseGuards(RolesGuard)
  // @Roles(RoleType.ADMIN, RoleType.SERVICE_MANAGER)
  async update(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    const fnName = this.update.name;
    const input = `Input : Id : ${id}, Update object : ${JSON.stringify(updateCustomerDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      updateCustomerDto.updatedBy = userId;
      this.logger.debug(`${fnName} : Calling Update service`);
      return await this.customerService.update(id, updateCustomerDto);
    }
  }

  @Get()
  // @UseGuards(RolesGuard)
  // @Roles(RoleType.ADMIN, RoleType.SERVICE_MANAGER, RoleType.FIELD_ENGINEER)
  async findAll(@Query() searchCriteria: FindCustomerDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find Customer with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findAll service`);

    return await this.customerService.findAll(searchCriteria);
  }

  @Get('id')
  // @UseGuards(RolesGuard)
  // @Roles(RoleType.ADMIN, RoleType.SERVICE_MANAGER, RoleType.FIELD_ENGINEER)
  async findOneById(@Query('id') id: string) {
    const fnName = this.findOneById.name;
    const input = `Input : Find Customer by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findOneById service`);

    return await this.customerService.findOneById(id);
  }

  @Get('phone')
  // @UseGuards(RolesGuard)
  // @Roles(RoleType.ADMIN, RoleType.SERVICE_MANAGER, RoleType.FIELD_ENGINEER)
  async findByPhone(@Query('phone') phone: string) {
    const fnName = this.findByPhone.name;
    const input = `Input : Find Customer by phone : ${phone}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findByPhone service`);

    // return await this.customerService.findByPhone(phone);
  }

  @Delete()
  // @UseGuards(RolesGuard)
  // @Roles(RoleType.ADMIN, RoleType.SERVICE_MANAGER)
  async remove(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.remove.name;
    const input = `Input : Customer id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling delete service`);
      return await this.customerService.delete(id);
    }
  }

  //  @Delete('softDelete')
  // async softDelete(@UserId() userId: string, @Query('id') id: string) {
  //   const fnName = this.softDelete.name;
  //   const input = `Input : Customer id : ${id} to be softDeleted`;

  //   // this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     // this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     let CustomerToBeSoftDeleted = await this.CustomerService.findOneById(id);
  //     if (CustomerToBeSoftDeleted) {
  //       CustomerToBeSoftDeleted.deletedBy = userId;
  //       // this.logger.debug(`${fnName} : Calling softDelete service`);
  //       return await this.CustomerService.softDelete(
  //         id,
  //         CustomerToBeSoftDeleted,
  //       );
  //     } else {
  //       // this.logger.error(`${fnName} : Customer id : ${id} not found`);
  //       throw new Error(`Customer id : ${id} not found`);
  //     }
  //   }
  // }

  // @Patch('restore')
  // async restore(@UserId() userId: string, @Query('id') id: string) {
  //   const fnName = this.restore.name;
  //   const input = `Input : Customer id : ${id} to be restored`;

  //   // this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (userId == null) {
  //     // this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
  //     throw Error(USER_NOT_IN_REQUEST_HEADER);
  //   } else {
  //     // this.logger.debug(`${fnName} : Calling restore service`);
  //     const restored = await this.CustomerService.restore(id);
  //     return restored;
  //   }
  // }
}
