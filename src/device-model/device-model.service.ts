import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceModel } from './entity/device-model.entity';
import { CreateDeviceModelDto, UpdateDeviceModelDto, FindDeviceModelDto } from './dto';
import { createLogger } from '../app_config/logger';
import { DUPLICATE_RECORD, KEY_SEPARATOR, NO_RECORD } from '../app_config/constants';

@Injectable()
export class DeviceModelService {
  private readonly logger = createLogger(DeviceModelService.name);

  constructor(
    @InjectRepository(DeviceModel)
    private readonly repo: Repository<DeviceModel>,
  ) { }

  async create(createDeviceModelDto: CreateDeviceModelDto) {
    const fnName = this.create.name;
    const input = `Create Object : ${JSON.stringify(createDeviceModelDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const deviceManufacturerId = createDeviceModelDto.deviceManufacturerId;
    const name = createDeviceModelDto.name;

    const result = await this.repo.findOneBy({ deviceManufacturerId, name });
    if (result) {
      this.logger.error(`${fnName} : ${DUPLICATE_RECORD} : DeviceModel ${result.id} already exists`);
      throw new Error(`${DUPLICATE_RECORD} : DeviceModel ${result.id} already exists`);
    } else {
      const deviceModelObj = this.repo.create(createDeviceModelDto);
      this.logger.debug(`${fnName} : Created DeviceModel is : ${JSON.stringify(deviceModelObj)}`);
      return await this.repo.save(deviceModelObj);
    }
  }

  async update(id: string, updateDeviceModelDto: UpdateDeviceModelDto): Promise<DeviceModel> {
    const fnName = this.update.name;
    const input = `Id : ${id}, Update Object : ${JSON.stringify(updateDeviceModelDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const mergedDeviceModel = await this.repo.preload({ id, ...updateDeviceModelDto });
    if (mergedDeviceModel == null) {
      this.logger.error(`${fnName} : ${NO_RECORD} : DeviceModel id : ${id} not found`);
      throw new Error(`${NO_RECORD} : DeviceModel id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : Merged DeviceModel is : ${JSON.stringify(mergedDeviceModel)}`);
      return await this.repo.save(mergedDeviceModel);
    }
  }

  async findAll(searchCriteria: FindDeviceModelDto, relationsRequired: boolean = true): Promise<DeviceModel[]> {
    const fnName = this.findAll.name;
    const input = `Input : Find DeviceModel with searchCriteria : ${JSON.stringify(searchCriteria)}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    // const relations = relationsRequired ? ['deviceType', 'manufacturer', 'devices'] : [];
    const relations = ["deviceType", "deviceManufacturer", "devices"]
    return this.repo.find({ relations: relations, where: searchCriteria, order: { name: 'ASC' } });
  }

  async findOneById(id: string): Promise<DeviceModel> {
    const fnName = this.findOneById.name;
    const input = `Input : Find DeviceModel by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const deviceModel = await this.repo.findOne({
      where: { id },
      relations: ['deviceType', 'manufacturer', 'devices'],
    });
    if (!deviceModel) {
      this.logger.error(`${fnName} : ${NO_RECORD} : DeviceModel id : ${id} not found`);
      throw new Error(`${NO_RECORD} : DeviceModel id : ${id} not found`);
    }
    return deviceModel;
  }

  async findByManufacturer(deviceManufacturerId: string): Promise<DeviceModel[]> {
    const fnName = this.findByManufacturer.name;
    const input = `Input : Find DeviceModel by manufacturerId : ${deviceManufacturerId}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.repo.find({
      where: { deviceManufacturerId },
      relations: ['deviceType', 'manufacturer'],
    });
  }

  async findByDeviceType(deviceTypeId: string): Promise<DeviceModel[]> {
    const fnName = this.findByDeviceType.name;
    const input = `Input : Find DeviceModel by deviceTypeId : ${deviceTypeId}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.repo.find({
      where: { deviceTypeId },
      relations: ['deviceType', 'manufacturer'],
    });
  }

  async delete(id: string): Promise<any> {
    const fnName = this.delete.name;
    const input = `Input : DeviceModel id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : DeviceModel id : ${id} not found`);
      throw new Error(`${NO_RECORD} : DeviceModel id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : DeviceModel id : ${id} deleted successfully`);
      return result;
    }
  }

  async softDelete(id: string, deletedBy: string): Promise<any> {
    const fnName = this.softDelete.name;
    const input = `Input : DeviceModel id : ${id} to be softDeleted`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const deviceModel = await this.findOneById(id);
    deviceModel.deletedBy = deletedBy;
    await this.repo.save(deviceModel);

    const result = await this.repo.softDelete(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : DeviceModel id : ${id} not found`);
      throw new Error(`${NO_RECORD} : DeviceModel id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : DeviceModel id : ${id} softDeleted successfully`);
      return result;
    }
  }

  async restore(id: string): Promise<DeviceModel> {
    const fnName = this.restore.name;
    this.logger.debug(`${fnName} : Restoring DeviceModel id : ${id}`);

    const result = await this.repo.restore(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : DeviceModel id : ${id} not found`);
      throw new Error(`${NO_RECORD} : DeviceModel id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : DeviceModel id : ${id} restored successfully`);
      const restored = await this.findOneById(id);
      // restored.deletedBy = undefined;
      return await this.repo.save(restored);
    }
  }
}
