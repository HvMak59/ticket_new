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
import { DeviceTypeService } from './device-type.service';
import { CreateDeviceTypeDto, UpdateDeviceTypeDto, FindDeviceTypeDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserId } from '../utils/req-user-id-decorator';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER, NO_RECORD } from '../app_config/constants';

@Controller('device-type')
export class DeviceTypeController {
  private readonly logger = createLogger(DeviceTypeController.name);

  constructor(private readonly deviceTypeService: DeviceTypeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@UserId() userId: string, @Body() createDeviceTypeDto: CreateDeviceTypeDto) {
    const fnName = this.create.name;
    const input = `Input : ${JSON.stringify(createDeviceTypeDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      createDeviceTypeDto.createdBy = userId;
      this.logger.debug(`${fnName} : Calling Create service`);
      return await this.deviceTypeService.create(createDeviceTypeDto);
    }
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async update(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body() updateDeviceTypeDto: UpdateDeviceTypeDto,
  ) {
    const fnName = this.update.name;
    const input = `Input : Id : ${id}, Update object : ${JSON.stringify(updateDeviceTypeDto)}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      updateDeviceTypeDto.updatedBy = userId;
      this.logger.debug(`${fnName} : Calling Update service`);
      return await this.deviceTypeService.update(id, updateDeviceTypeDto);
    }
  }

  @Get()
  async findAll(@Query() searchCriteria: FindDeviceTypeDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find DeviceType with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findAll service`);

    return await this.deviceTypeService.findAll(searchCriteria);
  }

  @Get('id')
  async findOneById(@Query('id') id: string) {
    const fnName = this.findOneById.name;
    const input = `Input : Find DeviceType by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findOneById service`);

    return await this.deviceTypeService.findOneById(id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async remove(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.remove.name;
    const input = `Input : DeviceType id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling delete service`);
      return await this.deviceTypeService.delete(id);
    }
  }

  @Delete('softDelete')
  @UseGuards(JwtAuthGuard)
  async softDelete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : DeviceType id : ${id} to be softDeleted`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      const deviceType = await this.deviceTypeService.findOneById(id);
      if (deviceType) {
        return await this.deviceTypeService.softDelete(id, userId);
      } else {
        this.logger.error(`${fnName} : ${NO_RECORD} : DeviceType id : ${id} not found`);
        throw new Error(`DeviceType id : ${id} not found`);
      }
    }
  }

  @Patch('restore')
  @UseGuards(JwtAuthGuard)
  async restore(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.restore.name;
    const input = `Input : DeviceType id : ${id} to be restored`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling restore service`);
      return await this.deviceTypeService.restore(id);
    }
  }
}
