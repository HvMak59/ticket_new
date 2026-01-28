import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceManufacturer } from './entity/device-manufacturer.entity';
import { CreateDeviceManufacturerDto, UpdateDeviceManufacturerDto, FindDeviceManufacturerDto } from './dto';
import { createLogger } from '../app_config/logger';
import { DUPLICATE_RECORD, KEY_SEPARATOR, NO_RECORD } from '../app_config/constants';
import serviceConfig from '../app_config/service.config.json';

@Injectable()
export class DeviceManufacturerService {
  private readonly logger = createLogger(DeviceManufacturerService.name);
  private readonly relations = serviceConfig.deviceManufacturer.relations;

  constructor(
    @InjectRepository(DeviceManufacturer)
    private readonly repo: Repository<DeviceManufacturer>,
  ) { }

  async create(createDeviceManufacturerDto: CreateDeviceManufacturerDto) {
    const fnName = this.create.name;
    const input = `Create Object : ${JSON.stringify(createDeviceManufacturerDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.findOneBy({ id: createDeviceManufacturerDto.id });
    // console.log(result);

    if (result != null) {
      this.logger.error(`${fnName} : ${DUPLICATE_RECORD} : DeviceManufacturer name : ${result.name} already exists`);
      throw new Error(`${DUPLICATE_RECORD} : DeviceManufacturer name : ${result.name} already exists`);
    } else {
      const manufacturer = this.repo.create(createDeviceManufacturerDto);
      this.logger.debug(`${fnName} : ${JSON.stringify(manufacturer)} to be created`);
      return await this.repo.save(manufacturer);
    }
  }

  async update(id: string, updateDeviceManufacturerDto: UpdateDeviceManufacturerDto) {
    const fnName = this.update.name;
    const input = `Input Id : ${id}, Update Object : ${JSON.stringify(updateDeviceManufacturerDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    if (id == null) {
      throw new Error('DeviceManufacturer id is not available');
    }
    else if (updateDeviceManufacturerDto.id == null) {
      updateDeviceManufacturerDto.id = id;
    }
    else if (updateDeviceManufacturerDto.id != id) {
      throw new Error('DeviceManufacturer id does not match with update device object');
    }
    const mergedManufacturer = await this.repo.preload(updateDeviceManufacturerDto);
    if (mergedManufacturer == null) {
      this.logger.error(`${fnName} : ${NO_RECORD} : DeviceManufacturer id : ${id} not found`);
      throw new Error(`${NO_RECORD} : DeviceManufacturer id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : Merged DeviceManufacturer is : ${JSON.stringify(mergedManufacturer)}`);
      return await this.repo.save(mergedManufacturer);
    }
  }

  async findAll(searchCriteria?: FindDeviceManufacturerDto, relationsRequired: boolean = false) {
    const fnName = this.findAll.name;
    const input = `Input : Find DeviceManufacturer with searchCriteria : ${JSON.stringify(searchCriteria)}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const relations = relationsRequired ? this.relations : [];
    return this.repo.find({ relations, where: searchCriteria, order: { name: 'ASC' } });
  }

  async findOneById(id: string) {
    const fnName = this.findOneById.name;
    const input = `Input : Find DeviceManufacturer by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const deviceManufacturer = await this.repo.findOne({ where: { id }, relations: ['deviceModels'] });
    if (!deviceManufacturer) {
      this.logger.error(`${fnName} : ${NO_RECORD} : DeviceManufacturer id : ${id} not found`);
      throw new Error(`${NO_RECORD} : DeviceManufacturer id : ${id} not found`);
    }
    return deviceManufacturer;
  }

  async delete(id: string) {
    const fnName = this.delete.name;
    const input = `Input : DeviceManufacturer id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : DeviceManufacturer id : ${id} not found`);
      throw new Error(`${NO_RECORD} : DeviceManufacturer id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : Manufacturer id : ${id} deleted successfully`);
      return result;
    }
  }

  async softDelete(id: string, deletedBy: string): Promise<any> {
    const fnName = this.softDelete.name;
    const input = `Input : DeviceManufacturer id : ${id} to be softDeleted`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const deviceManufacturer = await this.findOneById(id);
    deviceManufacturer.deletedBy = deletedBy;
    await this.repo.save(deviceManufacturer);

    const result = await this.repo.softDelete(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : DeviceManufacturer id : ${id} not found`);
      throw new Error(`${NO_RECORD} : DeviceManufacturer id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : DeviceManufacturer id : ${id} softDeleted successfully`);
      return result;
    }
  }

  async restore(id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : Restore Device : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const result = await this.repo.restore(id);
    if (result.affected === 0) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : DeviceManufacturer id : ${id} not found`,
      );
      throw new Error(`${NO_RECORD} : DeviceManufacturer id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} DeviceManufacturer id : ${id} restored successfully`);
      let restored = await this.findOneById(id);
      restored!.deletedBy = undefined;
      this.repo.save(restored!);
      return restored;
    }
  }
}
