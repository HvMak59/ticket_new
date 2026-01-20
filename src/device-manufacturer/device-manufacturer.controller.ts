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
import { DeviceManufacturerService } from './device-manufacturer.service';
import { CreateDeviceManufacturerDto, UpdateDeviceManufacturerDto, FindDeviceManufacturerDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserId } from '../utils/req-user-id-decorator';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER, NO_RECORD } from '../app_config/constants';

@Controller('device-manufacturer')
export class DeviceManufacturerController {
  private readonly logger = createLogger(DeviceManufacturerController.name);

  constructor(private readonly deviceManufacturerService: DeviceManufacturerService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @UserId() userId: string,
    @Body() createDeviceManufacturerDto: CreateDeviceManufacturerDto,
  ) {
    const fnName = this.create.name;
    const input = `Input : ${JSON.stringify(createDeviceManufacturerDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      createDeviceManufacturerDto.createdBy = userId;
      this.logger.debug(`${fnName} : Calling Create service`);
      return await this.deviceManufacturerService.create(createDeviceManufacturerDto);
    }
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async update(
    @Query('id') id: string,
    @UserId() userId: string,
    @Body() updateDeviceManufacturerDto: UpdateDeviceManufacturerDto,
  ) {
    const fnName = this.update.name;
    const input = `Input : Id : ${id}, Update object : ${JSON.stringify(updateDeviceManufacturerDto)}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      updateDeviceManufacturerDto.updatedBy = userId;
      this.logger.debug(`${fnName} : Calling Update service`);
      return await this.deviceManufacturerService.update(id, updateDeviceManufacturerDto);
    }
  }

  @Get()
  async findAll(@Query() searchCriteria: FindDeviceManufacturerDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find Manufacturer with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findAll service`);

    return await this.deviceManufacturerService.findAll(searchCriteria);
  }
  // 9099911677 - kalpesh raval ,adhar LL

  @Get('id')
  async findOneById(@Query('id') id: string) {
    const fnName = this.findOneById.name;
    const input = `Input : Find Manufacturer by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findOneById service`);

    return await this.deviceManufacturerService.findOneById(id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async remove(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.remove.name;
    const input = `Input : Manufacturer id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling delete service`);
      return await this.deviceManufacturerService.delete(id);
    }
  }

  @Delete('softDelete')
  @UseGuards(JwtAuthGuard)
  async softDelete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : Manufacturer id : ${id} to be softDeleted`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      const manufacturer = await this.deviceManufacturerService.findOneById(id);
      if (manufacturer) {
        return await this.deviceManufacturerService.softDelete(id, userId);
      } else {
        this.logger.error(`${fnName} : ${NO_RECORD} : Manufacturer id : ${id} not found`);
        throw new Error(`Manufacturer id : ${id} not found`);
      }
    }
  }

  @Patch('restore')
  @UseGuards(JwtAuthGuard)
  async restore(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.restore.name;
    const input = `Input : Manufacturer id : ${id} to be restored`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling restore service`);
      return await this.deviceManufacturerService.restore(id);
    }
  }
}
