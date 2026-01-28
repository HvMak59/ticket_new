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
import { Roles, RoleType } from '../common';
import { UserId } from '../utils/req-user-id-decorator';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from '../app_config/constants';
import { JwtAuthGuard } from 'src/auth/entities/jwt-auth-guard';

@Controller('device')
export class DeviceController {
  private readonly logger = createLogger(DeviceController.name);

  constructor(private readonly deviceService: DeviceService) { }

  @Post()
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
  // @UseGuards( RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.SERVICE_MANAGER)
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

  @Get('relation')
  async findAllWthRelation(@Query() searchCriteria: FindDeviceDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find Device with searchCriteria : ${JSON.stringify(searchCriteria)} with relation.`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const relationsRequired = true;
    this.logger.debug(`${fnName} : Calling findAllWthRelation service`);

    return await this.deviceService.findAll(searchCriteria, relationsRequired);
  }


  @Get('id')
  async findOneById(@Query('id') id: string) {
    const fnName = this.findOneById.name;
    const input = `Input : Find Device by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findOneById service`);

    return await this.deviceService.findOneById(id);
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
  // @UseGuards( RolesGuard)
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


  @Delete('softDelete')
  async softDelete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : SoftDelete Device : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      const deviceToBeDeleted = await this.deviceService.findOneById(id);
      deviceToBeDeleted.deletedBy = userId;
      this.logger.debug(`${fnName} : Calling softDelete service`);
      return await this.deviceService.softDelete(id);
    }
  }

  @Delete('restore')
  async restore(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : Restore Device : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling restore service`);
      return await this.deviceService.restore(id);
    }
  }
}
