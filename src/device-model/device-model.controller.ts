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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserId } from '../utils/req-user-id-decorator';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER, NO_RECORD } from '../app_config/constants';

@Controller('device-model')
export class DeviceModelController {
  private readonly logger = createLogger(DeviceModelController.name);

  constructor(private readonly deviceModelService: DeviceModelService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createDeviceModelDto: CreateDeviceModelDto,
    @UserId() userId: string,
  ) {
    const fnName = this.create.name;
    const input = `Input : ${JSON.stringify(createDeviceModelDto)}`;

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
  @UseGuards(JwtAuthGuard)
  async update(
    @Query('id') id: string,
    @UserId() userId: string,
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

    // if (manufacturerId) {
    //   this.logger.debug(`${fnName} : Calling findByManufacturer service`);
    //   return await this.deviceModelService.findByManufacturer(manufacturerId);
    // }
    // if (deviceTypeId) {
    //   this.logger.debug(`${fnName} : Calling findByDeviceType service`);
    //   return await this.deviceModelService.findByDeviceType(deviceTypeId);
    // }

    this.logger.debug(`${fnName} : Calling findAll service`);
    return await this.deviceModelService.findAll(searchCriteria);
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async softDelete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : DeviceModel id : ${id} to be softDeleted`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      const deviceModel = await this.deviceModelService.findOneById(id);
      if (deviceModel) {
        return await this.deviceModelService.softDelete(id, userId);
      } else {
        this.logger.error(`${fnName} : ${NO_RECORD} : DeviceModel id : ${id} not found`);
        throw new Error(`DeviceModel id : ${id} not found`);
      }
    }
  }

  @Patch('restore')
  @UseGuards(JwtAuthGuard)
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
