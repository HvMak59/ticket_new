import { Controller, Get, Post, Body, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto, FindRoleDto } from './dto';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, NO_RECORD, USER_NOT_IN_REQUEST_HEADER } from '../app_config/constants';
import { UserId } from '../utils/req-user-id-decorator';
import { RoleType } from '../common/enums';
import { JwtAuthGuard, RolesGuard, Roles } from '../common';

@Controller('role')
@UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(UserRole.ADMIN)
export class RoleController {
  private readonly logger = createLogger(RoleController.name);

  constructor(private readonly roleService: RoleService) { }

  @Post()
  async create(@UserId() userId: string, @Body() createRoleDto: CreateRoleDto) {
    const fnName = this.create.name;
    const input = `Input : create object : ${JSON.stringify(createRoleDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      createRoleDto.createdBy = userId;
      this.logger.debug(`${fnName} : Calling create service`);
      return await this.roleService.create(createRoleDto);
    }
  }

  @Get()
  async findAll(@Query() searchCriteria: FindRoleDto) {
    const fnName = this.findAll.name;
    const input = `Input : find role with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return await this.roleService.findAll(searchCriteria);
  }

  @Get('findOne')
  async findOne(@Query('id') id: RoleType) {
    const fnName = this.findOne.name;
    const input = `Input : find one role by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.roleService.findOneById(id);

    if (result == null) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Role id : ${id} not found`);
      throw new Error(`${NO_RECORD} : Role id : ${id} not found`);
    }

    return result;
  }

  @Patch()
  async update(
    @UserId() userId: string,
    @Query('id') id: RoleType,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const fnName = this.update.name;
    const input = `Input : id : ${id} and update object : ${JSON.stringify(updateRoleDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      updateRoleDto.updatedBy = userId;
      this.logger.debug(`${fnName} : Calling update service`);
      return await this.roleService.update(id, updateRoleDto);
    }
  }

  @Delete()
  async delete(@UserId() userId: string, @Query('id') id: RoleType) {
    const fnName = this.delete.name;
    const input = `Input : delete role with id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling delete service`);
      return await this.roleService.delete(id);
    }
  }
}
