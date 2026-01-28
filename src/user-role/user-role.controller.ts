import { Controller, Get, Post, Body, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { UserRoleService } from './user-role.service';
import { CreateUserRoleDto, UpdateUserRoleDto, FindUserRoleDto } from './dto';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, NO_RECORD, USER_NOT_IN_REQUEST_HEADER } from '../app_config/constants';
import { UserId } from '../utils/req-user-id-decorator';
import { Roles } from '../common';

@Controller('user-role')
// @UseGuards(RolesGuard)
// @Roles(UserRole.ADMIN)
export class UserRoleController {
  private readonly logger = createLogger(UserRoleController.name);

  constructor(private readonly userRoleService: UserRoleService) { }

  @Post()
  async create(
    @UserId() userId: string,
    @Body() createUserRoleDto: CreateUserRoleDto,
  ) {
    const fnName = this.create.name;
    const input = `Input : ${JSON.stringify(createUserRoleDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      createUserRoleDto.createdBy = userId;
      this.logger.debug(`${fnName} : Calling Create Service`);
      return await this.userRoleService.create(createUserRoleDto);
    }
  }

  @Get()
  async findAll(@Query() searchCriteria: FindUserRoleDto) {
    console.log("controller");
    const fnName = this.findAll.name;
    const input = `Input : Find UserRole with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return await this.userRoleService.findAll(searchCriteria);
  }

  @Get('findOne')
  async findOne(@Query('id') id: string) {
    const fnName = this.findOne.name;
    const input = `Input : find one by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.userRoleService.findOneById(id);

    if (result == null) {
      this.logger.error(`${fnName} : ${NO_RECORD} : UserRole id : ${id} not found`);
      throw new Error(`${NO_RECORD} : UserRole id : ${id} not found`);
    }

    return result;
  }

  @Patch()
  async update(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    const fnName = this.update.name;
    const input = `${fnName}: Input : Id : ${id}, Update Object : ${JSON.stringify(updateUserRoleDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      updateUserRoleDto.updatedBy = userId;
      this.logger.debug(`${fnName} : Calling update service`);

      return await this.userRoleService.update(id, updateUserRoleDto, userId);
    }
  }

  @Patch('updateFromUser')
  async updateFromUser(
    @UserId() userId: string,
    @Query('userId') targetUserId: string,
    @Body() updateUserRoleDTOs: UpdateUserRoleDto[],
  ) {
    const fnName = 'updateFromUser()';
    const input = `Input : UserId : ${targetUserId}, UpdateUserDto : ${JSON.stringify([...updateUserRoleDTOs])}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling updateFromUser service`);
      return await this.userRoleService.updateFromUser(targetUserId, updateUserRoleDTOs, userId);
    }
  }

  @Delete()
  async delete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.delete.name;
    const input = `Input : Delete UserRole with id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling delete service`);
      return await this.userRoleService.delete(id);
    }
  }

  @Delete('deleteByUserId')
  async deleteByUserId(@UserId() userId: string, @Query('userId') targetUserId: string) {
    const fnName = this.deleteByUserId.name;
    const input = `Input : Delete all roles for userId : ${targetUserId}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling deleteByUserId service`);
      return await this.userRoleService.deleteByUserId(targetUserId, userId);
    }
  }
}
