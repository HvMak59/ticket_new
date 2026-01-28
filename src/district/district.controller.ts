import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { DistrictService } from './district.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { FindDistrictDto } from './dto/find-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { UserId } from 'src/utils/req-user-id-decorator';
import { KEY_SEPARATOR, USER_NOT_IN_REQUEST_HEADER } from 'src/app_config/constants';
import { } from 'src/common';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';

@Controller('district')
export class DistrictController {
  private readonly logger = winstonServerLogger(DistrictController.name);
  constructor(private readonly districtService: DistrictService) { }

  @Post()
  async create(
    @UserId() userId: string,
    @Body() createDistrictDto: CreateDistrictDto,
  ) {
    const fnName = this.create.name;
    const input = `Input : ${JSON.stringify(createDistrictDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      createDistrictDto.createdBy = userId;
      this.logger.debug(`${fnName}: Calling create service`);
      return await this.districtService.create(createDistrictDto);
    }
  }

  @Get()
  async findAll(@Query() searchCriteria: FindDistrictDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find District with searchCriteria: ${JSON.stringify(
      searchCriteria,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName}: Calling findAll service`);

    return await this.districtService.findAll(searchCriteria);
  }

  @Get('relation')
  async findAllWthRelations(@Query() searchCriteria: FindDistrictDto) {
    const fnName = this.findAllWthRelations.name;
    const input = `Input : Find District with relations and searchCriteria: ${JSON.stringify(
      searchCriteria,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findAll service`);

    const relationsRequired = true;
    return await this.districtService.findAll(
      searchCriteria,
      relationsRequired,
    );
  }

  @Get('findOne')
  async findOne(@Query() searchCriteria: FindDistrictDto) {
    const fnName = this.findOne.name;
    const input = `Input : Find District with searchCriteria: ${JSON.stringify(
      searchCriteria,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName}: Calling findOne service`);

    return await this.districtService.findOne(searchCriteria);
  }

  @Get('findOne/relations')
  async findOneWthRelations(@Query() searchCriteria: FindDistrictDto) {
    const fnName = this.findOne.name;
    const input = `Input : Find District with relations and searchCriteria : ${JSON.stringify(
      searchCriteria,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findOne service`);

    const relationsRequired = true;
    return await this.districtService.findOne(
      searchCriteria,
      relationsRequired,
    );
  }

  @Patch()
  async update(
    @UserId() userId: string,
    @Query('id') id: string,
    @Body() updateDistrictDto: UpdateDistrictDto,
  ) {
    const fnName = this.update.name;
    const input = `Input : Id: ${id} and updateDistrictDto : ${JSON.stringify(
      updateDistrictDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      updateDistrictDto.updatedBy = userId;
      this.logger.debug(`${fnName}: Calling update service`);
      return await this.districtService.update(id, updateDistrictDto);
    }
  }

  @Delete()
  async remove(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.remove.name;
    const input = `Input : District id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName}: Calling delete service`);
    }
    return await this.districtService.delete(id);
  }

  @Delete('softDelete')
  async softDelete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : District id : ${id} to be softDeleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      let districtToBeSoftDeleted = await this.districtService.findOneById(id);
      if (districtToBeSoftDeleted) {
        districtToBeSoftDeleted.deletedBy = userId;
        this.logger.debug(`${fnName} : Calling softDelete service`);
        return await this.districtService.softDelete(
          id,
          districtToBeSoftDeleted,
        );
      } else {
        this.logger.error(`${fnName} : District id : ${id} not found`);
        throw new Error(`District id : ${id} not found`);
      }
    }
  }

  @Patch('restore')
  async restore(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.restore.name;
    const input = `Input : District id : ${id} to be restored`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling restore service`);
      const restored = await this.districtService.restore(id);
      return restored;
    }
  }
}
