import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceType } from './entity/device-type.entity';
import { CreateDeviceTypeDto, UpdateDeviceTypeDto, FindDeviceTypeDto } from './dto';
import { createLogger } from '../app_config/logger';
import { DUPLICATE_RECORD, KEY_SEPARATOR, NO_RECORD } from '../app_config/constants';

@Injectable()
export class DeviceTypeService {
  private readonly logger = createLogger(DeviceTypeService.name);

  constructor(
    @InjectRepository(DeviceType)
    private readonly repo: Repository<DeviceType>,
  ) {}

  async create(createDeviceTypeDto: CreateDeviceTypeDto): Promise<DeviceType> {
    const fnName = this.create.name;
    const input = `Create Object : ${JSON.stringify(createDeviceTypeDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const deviceType = await this.repo.findOneBy({ name: createDeviceTypeDto.name });
    if (deviceType) {
      this.logger.error(`${fnName} : ${DUPLICATE_RECORD} : DeviceType name : ${deviceType.name} already exists`);
      throw new Error(`${DUPLICATE_RECORD} : DeviceType name : ${deviceType.name} already exists`);
    } else {
      const res = this.repo.create(createDeviceTypeDto);
      this.logger.debug(`${fnName} : ${JSON.stringify(res)} created`);
      return await this.repo.save(res);
    }
  }

  async update(id: string, updateDeviceTypeDto: UpdateDeviceTypeDto): Promise<DeviceType> {
    const fnName = this.update.name;
    const input = `Id : ${id}, Update Object : ${JSON.stringify(updateDeviceTypeDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const mergedDeviceType = await this.repo.preload({ id, ...updateDeviceTypeDto });
    if (mergedDeviceType == null) {
      this.logger.error(`${fnName} : ${NO_RECORD} : DeviceType id : ${id} not found`);
      throw new Error(`${NO_RECORD} : DeviceType id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : Merged DeviceType is : ${JSON.stringify(mergedDeviceType)}`);
      return await this.repo.save(mergedDeviceType);
    }
  }

  async findAll(searchCriteria?: FindDeviceTypeDto, relationsRequired: boolean = false): Promise<DeviceType[]> {
    const fnName = this.findAll.name;
    const input = `Input : Find DeviceType with searchCriteria : ${JSON.stringify(searchCriteria)}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const relations = relationsRequired ? ['deviceModels'] : [];
    return this.repo.find({ relations, where: searchCriteria, order: { name: 'ASC' } });
  }

  async findOneById(id: string): Promise<DeviceType> {
    const fnName = this.findOneById.name;
    const input = `Input : Find DeviceType by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const deviceType = await this.repo.findOne({ where: { id }, relations: ['deviceModels'] });
    if (!deviceType) {
      this.logger.error(`${fnName} : ${NO_RECORD} : DeviceType id : ${id} not found`);
      throw new Error(`${NO_RECORD} : DeviceType id : ${id} not found`);
    }
    return deviceType;
  }

  async findByName(name: string): Promise<DeviceType | null> {
    const fnName = this.findByName.name;
    const input = `Input : Find DeviceType by name : ${name}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.repo.findOne({ where: { name } });
  }

  async delete(id: string): Promise<any> {
    const fnName = this.delete.name;
    const input = `Input : DeviceType id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : DeviceType id : ${id} not found`);
      throw new Error(`${NO_RECORD} : DeviceType id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : DeviceType id : ${id} deleted successfully`);
      return result;
    }
  }

  async softDelete(id: string, deletedBy: string): Promise<any> {
    const fnName = this.softDelete.name;
    const input = `Input : DeviceType id : ${id} to be softDeleted`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const deviceType = await this.findOneById(id);
    deviceType.deletedBy = deletedBy;
    await this.repo.save(deviceType);

    const result = await this.repo.softDelete(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : DeviceType id : ${id} not found`);
      throw new Error(`${NO_RECORD} : DeviceType id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : DeviceType id : ${id} softDeleted successfully`);
      return result;
    }
  }

  async restore(id: string): Promise<DeviceType> {
    const fnName = this.restore.name;
    this.logger.debug(`${fnName} : Restoring DeviceType id : ${id}`);

    const result = await this.repo.restore(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : DeviceType id : ${id} not found`);
      throw new Error(`${NO_RECORD} : DeviceType id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : DeviceType id : ${id} restored successfully`);
      const restored = await this.findOneById(id);
      // restored.deletedBy = undefined;
      return await this.repo.save(restored);
    }
  }
}
