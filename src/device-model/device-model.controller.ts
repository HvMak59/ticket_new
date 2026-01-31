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
import { DeviceModelService } from './device-model.service';
import { CreateDeviceModelDto, UpdateDeviceModelDto, FindDeviceModelDto } from './dto';
import { UserId } from '../utils/req-user-id-decorator';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER, NO_RECORD } from '../app_config/constants';

@Controller('device-model')
export class DeviceModelController {
  private readonly logger = createLogger(DeviceModelController.name);

  constructor(private readonly deviceModelService: DeviceModelService) { }

  @Post()
  async create(
    @UserId() userId: string,
    @Body() createDeviceModelDto: CreateDeviceModelDto,
  ) {
    const fnName = this.create.name;
    const input = `Input : CreateDeviceModelDto: ${JSON.stringify(createDeviceModelDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      createDeviceModelDto.createdBy = userId;
      this.logger.debug(`${fnName} : Calling Create service`);
      return await this.deviceModelService.create(createDeviceModelDto);
    }
  }

  @Patch()
  async update(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body() updateDeviceModelDto: UpdateDeviceModelDto,
  ) {
    const fnName = this.update.name;
    const input = `Input : Id : ${id} , updateDeviceModelDto : ${JSON.stringify(updateDeviceModelDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      updateDeviceModelDto.updatedBy = userId;
      this.logger.debug(`${fnName} : Calling update service`);
      return await this.deviceModelService.update(id, updateDeviceModelDto);
    }
  }

  @Get()
  async findAll(
    @Query() searchCriteria: FindDeviceModelDto,
  ) {
    const fnName = this.findAll.name;
    const input = `Input : Find DeviceModel with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    this.logger.debug(`${fnName} : Calling findAll service`);
    return await this.deviceModelService.findAll(searchCriteria);
  }

  @Get('relation')
  async findAllWthRelation(@Query() searchCriteria: FindDeviceModelDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find DeviceModel with searchCriteria : ${JSON.stringify(searchCriteria)} with relation.`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const relationsRequired = true;
    this.logger.debug(`${fnName} : Calling findAllWthRelation service`);

    return await this.deviceModelService.findAll(searchCriteria, relationsRequired);
  }


  @Get('id')
  async findOneById(@Query('id') id: string) {
    const fnName = this.findOneById.name;
    const input = `Input : Find DeviceModel by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findOneById service`);

    return await this.deviceModelService.findOneById(id);
  }

  @Delete()
  async remove(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.remove.name;
    const input = `Input : DeviceModel id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling delete service`);
      return await this.deviceModelService.delete(id);
    }
  }

  @Delete('softDelete')
  async softDelete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : DeviceModel id : ${id} to be softDeleted`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      return await this.deviceModelService.softDelete(id, userId);

      // const deviceModel = await this.deviceModelService.findOneById(id);
      // if (deviceModel) {
      //   return await this.deviceModelService.softDelete(id, userId);
      // } else {
      //   this.logger.error(`${fnName} : ${NO_RECORD} : DeviceModel id : ${id} not found`);
      //   throw new Error(`DeviceModel id : ${id} not found`);
      // }
    }
  }

  @Patch('restore')
  async restore(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.restore.name;
    const input = `Input : DeviceModel id : ${id} to be restored`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling restore service`);
      return await this.deviceModelService.restore(id);
    }
  }
}
