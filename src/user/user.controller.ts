import { Controller, Get, Post, Patch, Delete, Body, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
// import { CreateUserDto, UpdateUserDto, FindUserDto } from './dto';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, NO_RECORD, USER_NOT_IN_REQUEST_HEADER } from '../app_config/constants';
import { UserId } from '../utils/req-user-id-decorator';
import { Roles, RoleType } from '../common';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import { Token } from './token-extractor/token-extractor';
import { JwtAuthGuard } from 'src/auth/entities/jwt-auth-guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { getTokenString } from 'src/utils/other';
import { Token } from 'src/utils/token.decorator';

@Controller('user')
// @UseGuards(JwtAuthGuard)
export class UserController {
  private readonly logger = createLogger(UserController.name);

  constructor(private readonly userService: UserService) { }

  @Post()
  async create(
    @Token() token: string,
    @UserId() userId: string,
    @Body() createUserDto: CreateUserDto
  ) {
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
  async findAll(@Query() searchCriteria: FindUserDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find User with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return await this.userService.findAll(searchCriteria);
  }

  @Get('relations')
  async findAllWthRelations(@Query() searchCriteria: FindUserDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find User with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const relationsRequired = true;
    return await this.userService.findAll(searchCriteria, relationsRequired);
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


  @Patch()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(RoleType.ADMIN)
  async update(
    @Token() token: string,
    @UserId() userId: string,
    @Query('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const fnName = this.update.name;
    const input = `Input : Id : ${id}, updateUserDto : ${JSON.stringify(updateUserDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      updateUserDto.updatedBy = userId;
      this.logger.debug(`${fnName} : Calling Update Service`);

      // console.log("main", token)
      // const newT = getTokenString(token);
      // console.log("new", newT);

      return await this.userService.update(id, updateUserDto, token);
    }
  }

  @Delete()
  // @UseGuards(RolesGuard)
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
