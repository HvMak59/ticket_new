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
import { DeviceService } from './device.service';
import { CreateDeviceDto, UpdateDeviceDto, FindDeviceDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles, RoleType } from '../common';
import { UserId } from '../utils/req-user-id-decorator';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from '../app_config/constants';

@Controller('device')
export class DeviceController {
  private readonly logger = createLogger(DeviceController.name);

  constructor(private readonly deviceService: DeviceService) { }

  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(RoleType.ADMIN, RoleType.SERVICE_MANAGER)
  async create(
    @UserId() userId: string,
    @Body() createDeviceDto: CreateDeviceDto,
  ) {
    const fnName = this.create.name;
    const input = `Input : ${JSON.stringify(createDeviceDto)}`;

    this.logger.debug(`${fnName}${KEY_SEPARATOR}${input}`);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      createDeviceDto.createdBy = userId;
      this.logger.debug(`${fnName} : Calling Create service`);
      return await this.deviceService.create(createDeviceDto);
    }
  }

  @Patch()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(RoleType.ADMIN, RoleType.SERVICE_MANAGER)
  async update(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    const fnName = this.update.name;
    const input = `Input : Update object is : ${JSON.stringify(updateDeviceDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      updateDeviceDto.updatedBy = userId;
      this.logger.debug(`${fnName} : Calling Update service`);
      return await this.deviceService.update(id, updateDeviceDto);
    }
  }

  @Get()
  async findAll(@Query() searchCriteria: FindDeviceDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find Device with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findAll service`);

    return await this.deviceService.findAll(searchCriteria);
  }

  @Get('id')
  async findOneById(@Query('id') id: string) {
    const fnName = this.findOneById.name;
    const input = `Input : Find Device by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findOneById service`);

    return await this.deviceService.findOneById(id);
  }

  @Get('serial')
  async findBySerialNumber(@Query('serialNumber') serialNumber: string) {
    const fnName = this.findBySerialNumber.name;
    const input = `Input : Find Device by serialNumber : ${serialNumber}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findBySerialNumber service`);

    return await this.deviceService.findBySerialNumber(serialNumber);
  }

  @Get('warranty')
  async checkWarranty(@Query('id') id: string) {
    const fnName = this.checkWarranty.name;
    const input = `Input : Check warranty for Device id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling isUnderWarranty service`);

    const isUnderWarranty = await this.deviceService.isUnderWarranty(id);
    return { isUnderWarranty };
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.SERVICE_MANAGER)
  async remove(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.remove.name;
    const input = `Input : Device id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling delete service`);
      return await this.deviceService.delete(id);
    }
  }
}
