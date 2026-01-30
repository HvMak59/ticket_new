import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto, UpdateCustomerDto, FindCustomerDto } from './dto';
import { Roles, RoleType } from '../common';
import { UserId } from '../utils/req-user-id-decorator';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from '../app_config/constants';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/auth/entities/jwt-auth-guard';

@Controller('customer')
@UseGuards()
export class CustomerController {
  private readonly logger = createLogger(CustomerController.name);

  constructor(
    private readonly customerService: CustomerService,
    private readonly jwtService: JwtService,
  ) { }

  private working = 4;
  // @Post()
  // async create(
  //   // @UserId() userId: string,
  //   @Body() createCustomerDto: CreateCustomerDto) {
  //   const fnName = this.create.name;
  //   const input = `Input : ${JSON.stringify(createCustomerDto)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   createCustomerDto.createdBy = createCustomerDto.name;
  //   this.logger.debug(`${fnName} : Calling Create service`);
  //   return await this.customerService.create(createCustomerDto);
  // }


  @Post()
  async create(
    @UserId() userId: string,
    @Body() createCustomerDto: CreateCustomerDto) {
    const fnName = this.create.name;
    const input = `Input : ${JSON.stringify(createCustomerDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    else {
      createCustomerDto.createdBy = userId;
      this.logger.debug(`${fnName} : Calling Create service`);
      return await this.customerService.create(createCustomerDto);
    }
  }


  private check = 5;
  // @Post()
  // async create(
  //   @Req() req: any,
  //   @Body() createCustomerDto: CreateCustomerDto,
  // ) {
  //   const fnName = this.create.name;

  //   this.logger.debug(
  //     `${fnName} : Input : ${JSON.stringify(createCustomerDto)}`,
  //   );

  //   const user = req.user;

  //   if (!user?.sub) {
  //     throw new ForbiddenException(
  //       'Customer already exists',
  //     );
  //   }
  //   // createdBy → self (or email, or other choice)
  //   // createCustomerDto.createdBy = user.email;
  //   createCustomerDto.createdBy = createCustomerDto.name;

  //   const customer = await this.customerService.create(createCustomerDto);

  //   const payload = {
  //     sub: customer.id,
  //     email: customer.emailId,
  //     role: RoleType.CUSTOMER,
  //   };

  //   return {
  //     accessToken: this.jwtService.sign(payload),
  //     customer,
  //   };
  // }

  @Patch()
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
  async findAll(@Query() searchCriteria: FindCustomerDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find Customer with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findAll service`);

    return await this.customerService.findAll(searchCriteria);
  }

  @Get('relations')
  async findAllWthRelations(@Query() searchCriteria: FindCustomerDto) {
    const fnName = this.findAllWthRelations.name;
    const input = `Input : Find Customer with where searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const relationsRequired = true;

    this.logger.debug(`${fnName} : Calling findAll service`);
    return await this.customerService.findAll(searchCriteria, relationsRequired);
  }

  @Get('id')
  async findOneById(@Query('id') id: string) {
    const fnName = this.findOneById.name;
    const input = `Input : Find Customer by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findOneById service`);

    return await this.customerService.findOneById(id);
  }

  @Delete()
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

  @Delete('softDelete')
  async softDelete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : SoftDelete Customer : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      const CustomerToBeDeleted = await this.customerService.findOneById(id);
      CustomerToBeDeleted.deletedBy = userId;
      this.logger.debug(`${fnName} : Calling softDelete service`);
      return await this.customerService.softDelete(id);
    }
  }

  @Delete('restore')
  async restore(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : Restore Customer : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling restore service`);
      return await this.customerService.restore(id);
    }
  }
}
