import { Controller, Get, Post, Patch, Delete, Body, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
// import { CreateUserDto, UpdateUserDto, FindUserDto } from './dto';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, NO_RECORD, USER_NOT_IN_REQUEST_HEADER } from '../app_config/constants';
import { UserId } from '../utils/req-user-id-decorator';
import { JwtAuthGuard, RolesGuard, Roles, RoleType } from '../common';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Token } from './token-extractor/token-extractor';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  private readonly logger = createLogger(UserController.name);

  constructor(private readonly userService: UserService) { }

  @Post()
  async create(
    @Token() token: string,
    @UserId() userId: string,
    @Body() createUserDto: CreateUserDto) {
    const fnName = this.create.name;
    const input = `Input : ${JSON.stringify(createUserDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      createUserDto.createdBy = userId;
      this.logger.debug(`${fnName} : Calling Create service`);
      return await this.userService.create(token, createUserDto);
    }
  }

  @Get()
  @UseGuards(RolesGuard)
  async findAll(@Query() searchCriteria: FindUserDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find User with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return await this.userService.findAll(searchCriteria);
  }

  @Get('findOne')
  async findOne(@Query('id') id: string) {
    const fnName = this.findOne.name;
    const input = `Input : find one user by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.userService.findOneById(id);

    if (result == null) {
      this.logger.error(`${fnName} : ${NO_RECORD} : User id : ${id} not found`);
      throw new Error(`${NO_RECORD} : User id : ${id} not found`);
    }

    return result;
  }

  @Get('engineers')
  @UseGuards(RolesGuard)
  async getFieldEngineers() {
    const fnName = this.getFieldEngineers.name;

    this.logger.debug(`${fnName} : Getting all field engineers`);

    return await this.userService.getFieldEngineers();
  }

  @Get('search')
  @UseGuards(RolesGuard)
  async searchUsers(@Query('term') searchTerm: string) {
    const fnName = this.searchUsers.name;
    const input = `Input : Search term : ${searchTerm}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return await this.userService.findBySearchTerm(searchTerm);
  }

  @Patch()
  async update(@UserId() userId: string, @Query('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const fnName = this.update.name;
    const input = `Input : Id : ${id}, updateUserDto : ${JSON.stringify(updateUserDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      updateUserDto.updatedBy = userId;
      this.logger.debug(`${fnName} : Calling Update Service`);

      // return await this.userService.update(id, updateUserDto);
    }
  }

  @Delete()
  @UseGuards(RolesGuard)
  async delete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.delete.name;
    const input = `Input : Delete user with id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling delete service`);
      return await this.userService.delete(id, userId);
    }
  }
}
