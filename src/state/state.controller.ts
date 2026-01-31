import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StateService } from './state.service';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { FindStateDto } from './dto/find-state.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { UserId } from 'src/utils/req-user-id-decorator';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from 'src/app_config/constants';
import { JwtAuthGuard } from 'src/auth/entities/jwt-auth-guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles, RoleType } from 'src/common';
// import { winstonServerLogger } from 'app_config/serverWinston.config';
// import { UserId } from 'utils/req-user-id.decorator';
// import {
//   KEY_SEPARATOR,
//   USER_NOT_IN_REQUEST_HEADER,
// } from 'app_config/constants';

@Controller('state')
export class StateController {
  private readonly logger = winstonServerLogger(StateController.name);
  constructor(private readonly stateService: StateService) { }

  @Post()
  async create(
    @UserId() userId: string,
    @Body() createStateDto: CreateStateDto,
  ) {
    const fnName = this.create.name;
    const input = `Input : ${JSON.stringify(createStateDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      createStateDto.createdBy = userId;
      this.logger.debug(`${fnName}: Calling create service`);
      return await this.stateService.create(createStateDto);
    }
  }

  @Get()
  async findAll(@Query() searchCriteria: FindStateDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find state with searchCriteria: ${JSON.stringify(
      searchCriteria,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return await this.stateService.findAll(searchCriteria);
  }

  @Get('relations')
  async findAllWthRelations(@Query() searchCriteria: FindStateDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find state with searchCriteria: ${JSON.stringify(
      searchCriteria,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const relationsRequired = true;
    this.logger.debug(`${fnName}: Calling findAll service`);

    return await this.stateService.findAll(searchCriteria, relationsRequired);
  }

  @Get('findOne')
  async findOne(@Query() searchCriteria: FindStateDto) {
    const fnName = this.findOne.name;
    const input = `Input : Find state with searchCriteria: ${JSON.stringify(
      searchCriteria,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName}: Calling findOne service`);

    return await this.stateService.findOne(searchCriteria);
  }

  @Get('findOne/relations')
  async findOneWthRelations(@Query() searchCriteria: FindStateDto) {
    const fnName = this.findOne.name;
    const input = `Input : Find state with relations and searchCriteria : ${JSON.stringify(
      searchCriteria,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findOne service`);

    const relationsRequired = true;
    return await this.stateService.findOne(searchCriteria, relationsRequired);
  }

  @Patch()
  async update(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body() updateStateDto: UpdateStateDto,
  ) {
    const fnName = this.update.name;
    const input = `Input : Id: ${id} and updateStateDto : ${JSON.stringify(
      updateStateDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      updateStateDto.updatedBy = userId;
      this.logger.debug(`${fnName}: Calling update service`);
      return await this.stateService.update(id, updateStateDto);
    }
  }

  @Delete()
  async remove(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.remove.name;
    const input = `Input : State id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName}: Calling delete service`);
    }
    return await this.stateService.delete(id);
  }

  @Delete('softDelete')
  async softDelete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : State id : ${id} to be softDeleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      let stateToBeSoftDeleted = await this.stateService.findOneById(id);
      if (stateToBeSoftDeleted) {
        stateToBeSoftDeleted.deletedBy = userId;
        this.logger.debug(`${fnName} : Calling softDelete service`);
        return await this.stateService.softDelete(id, stateToBeSoftDeleted);
      } else {
        this.logger.error(`${fnName} : State id : ${id} not found`);
        throw new Error(`State id : ${id} not found`);
      }
    }
  }
  // 
  @Patch('restore')
  async restore(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.restore.name;
    const input = `Input : State id : ${id} to be restored`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling restore service`);
      const restored = await this.stateService.restore(id);
      return restored;
    }
  }
}
