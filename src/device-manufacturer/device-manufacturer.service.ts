import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceManufacturer } from './entity/device-manufacturer.entity';
import { CreateDeviceManufacturerDto, UpdateDeviceManufacturerDto, FindDeviceManufacturerDto } from './dto';
import { createLogger } from '../app_config/logger';
import { DUPLICATE_RECORD, KEY_SEPARATOR, NO_RECORD } from '../app_config/constants';

@Injectable()
export class DeviceManufacturerService {
  private readonly logger = createLogger(DeviceManufacturerService.name);

  constructor(
    @InjectRepository(DeviceManufacturer)
    private readonly repo: Repository<DeviceManufacturer>,
  ) { }

  async create(createDeviceManufacturerDto: CreateDeviceManufacturerDto): Promise<DeviceManufacturer> {
    const fnName = this.create.name;
    const input = `Create Object : ${JSON.stringify(createDeviceManufacturerDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.findOneBy({ id: createDeviceManufacturerDto.id });
    // console.log(result);

    if (result != null) {
      this.logger.error(`${fnName} : ${DUPLICATE_RECORD} : Manufacturer name : ${result.name} already exists`);
      throw new Error(`${DUPLICATE_RECORD} : Manufacturer name : ${result.name} already exists`);
    } else {
      const manufacturer = this.repo.create(createDeviceManufacturerDto);
      this.logger.debug(`${fnName} : ${JSON.stringify(manufacturer)} created`);
      return await this.repo.save(manufacturer);
    }
  }

  async update(id: string, updateDeviceManufacturerDto: UpdateDeviceManufacturerDto): Promise<DeviceManufacturer> {
    const fnName = this.update.name;
    const input = `Input Id : ${id}, Update Object : ${JSON.stringify(updateDeviceManufacturerDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const mergedManufacturer = await this.repo.preload({ id, ...updateDeviceManufacturerDto });
    if (mergedManufacturer == null) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Manufacturer id : ${id} not found`);
      throw new Error(`${NO_RECORD} : Manufacturer id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : Merged Manufacturer is : ${JSON.stringify(mergedManufacturer)}`);
      return await this.repo.save(mergedManufacturer);
    }
  }

  async findAll(searchCriteria?: FindDeviceManufacturerDto, relationsRequired: boolean = false): Promise<DeviceManufacturer[]> {
    const fnName = this.findAll.name;
    const input = `Input : Find Manufacturer with searchCriteria : ${JSON.stringify(searchCriteria)}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    // const relations = relationsRequired ? ['deviceModels'] : [];
    const relations = ["deviceModels"]
    return this.repo.find({ relations, where: searchCriteria, order: { name: 'ASC' } });
  }

  async findOneById(id: string): Promise<DeviceManufacturer> {
    const fnName = this.findOneById.name;
    const input = `Input : Find Manufacturer by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const manufacturer = await this.repo.findOne({ where: { id }, relations: ['deviceModels'] });
    if (!manufacturer) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Manufacturer id : ${id} not found`);
      throw new Error(`${NO_RECORD} : Manufacturer id : ${id} not found`);
    }
    return manufacturer;
  }

  async findByName(name: string): Promise<DeviceManufacturer | null> {
    const fnName = this.findByName.name;
    const input = `Input : Find Manufacturer by name : ${name}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.repo.findOne({ where: { name } });
  }

  async delete(id: string): Promise<any> {
    const fnName = this.delete.name;
    const input = `Input : Manufacturer id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Manufacturer id : ${id} not found`);
      throw new Error(`${NO_RECORD} : Manufacturer id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : Manufacturer id : ${id} deleted successfully`);
      return result;
    }
  }

  async softDelete(id: string, deletedBy: string): Promise<any> {
    const fnName = this.softDelete.name;
    const input = `Input : Manufacturer id : ${id} to be softDeleted`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const manufacturer = await this.findOneById(id);
    manufacturer.deletedBy = deletedBy;
    await this.repo.save(manufacturer);

    const result = await this.repo.softDelete(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Manufacturer id : ${id} not found`);
      throw new Error(`${NO_RECORD} : Manufacturer id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : Manufacturer id : ${id} softDeleted successfully`);
      return result;
    }
  }

  async restore(id: string): Promise<DeviceManufacturer> {
    const fnName = this.restore.name;
    this.logger.debug(`${fnName} : Restoring Manufacturer id : ${id}`);

    const result = await this.repo.restore(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Manufacturer id : ${id} not found`);
      throw new Error(`${NO_RECORD} : Manufacturer id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : Manufacturer id : ${id} restored successfully`);
      const restored = await this.findOneById(id);
      // restored.deletedBy = undefined;
      return await this.repo.save(restored);
    }
  }
}
