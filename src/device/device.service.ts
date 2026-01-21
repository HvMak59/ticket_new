import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './entity/device.entity';
import { CreateDeviceDto, UpdateDeviceDto, FindDeviceDto } from './dto';
import { createLogger } from '../app_config/logger';
import { DUPLICATE_RECORD, KEY_SEPARATOR, NO_RECORD } from '../app_config/constants';
// import serviceConfig from '../../app_config/service.config.json';

@Injectable()
export class DeviceService {
  private readonly logger = createLogger(DeviceService.name);
  // private readonly relations = servic
  constructor(
    @InjectRepository(Device)
    private readonly repo: Repository<Device>,
  ) { }

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const fnName = this.create.name;
    const input = `Input : Create Object : ${JSON.stringify(createDeviceDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.findOneBy({ serialNumber: createDeviceDto.serialNumber });
    if (result != null) {
      this.logger.error(`${fnName} : ${DUPLICATE_RECORD} : Device ${result.id} already exists`);
      throw new Error(`${DUPLICATE_RECORD} : Device ${result.id} already exists`);
    } else {
      const deviceObj = this.repo.create(createDeviceDto);
      this.logger.debug(`${fnName} : ToBeCreated Device is : ${JSON.stringify(deviceObj)}`);
      return await this.repo.save(deviceObj);
    }
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto) {
    const fnName = this.update.name;
    const input =
      'Input : id : ' +
      id +

      ' updateDevice : ' +
      JSON.stringify(updateDeviceDto);

    this.logger.debug(`${fnName} : ${input}`);

    if (id == null) {
      throw new Error('Device id is not available');
    }
    else if (updateDeviceDto.id == null) {
      updateDeviceDto.id = id;
    }
    else if (updateDeviceDto.id != id) {
      throw new Error('Device id does not match with update device object');
    }
    const mergedDevice = await this.repo.preload(updateDeviceDto);
    this.logger.debug(
      `${fnName} : mergedDevice : ${JSON.stringify(mergedDevice)}`,
    );
    if (mergedDevice == null) {
      throw new Error(`Device id ${id} does not exist`);
    } else {
      return await this.repo.save(mergedDevice);
    }
  }

  async findAll(searchCriteria: FindDeviceDto) {
    const fnName = this.findAll.name;
    const input = `Input : Find Device with searchCriteria : ${JSON.stringify(searchCriteria)}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.repo.find({
      where: searchCriteria,
      relations: ["deviceModel", "deviceManufacturer"],
    });
  }

  async findOneById(id: string): Promise<Device> {
    const fnName = this.findOneById.name;
    const input = `Input : Find Device by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const device = await this.repo.findOne({
      where: { id },
      relations: ['deviceModel', 'deviceModel.deviceType', 'deviceModel.manufacturer'],
    });
    if (!device) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Device id : ${id} not found`);
      throw new Error(`${NO_RECORD} : Device id : ${id} not found`);
    }
    return device;
  }

  async findBySerialNumber(serialNumber: string) {
    const fnName = this.findBySerialNumber.name;
    const input = `Input : Find Device by serialNumber : ${serialNumber}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.repo.findOne({
      where: { serialNumber },
      relations: ['deviceModel', 'deviceModel.deviceType', 'deviceModel.manufacturer'],
    });
  }

  // 
  async findOrCreate(createDeviceDto: CreateDeviceDto) {
    const fnName = this.findOrCreate.name;
    const input = `Input : FindOrCreate Device : ${JSON.stringify(createDeviceDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    let device = await this.repo.findOne({ where: { id: createDeviceDto.id } });

    if (!device) {
      this.logger.debug(`${fnName} : Device not found, creating new one`);
      device = this.repo.create(createDeviceDto);
      device = await this.repo.save(device);
    }
    return device;
  }


  async isUnderWarranty(deviceId: string) {
    const fnName = this.isUnderWarranty.name;
    const input = `Input : Check warranty for Device id : ${deviceId}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const device = await this.findOneById(deviceId);
    // if (!device.warrantyExpiry) return false;
    // const isUnderWarranty = new Date(device.warrantyExpiry) > new Date();
    // this.logger.debug(`${fnName} : Device ${deviceId} warranty status : ${isUnderWarranty}`);
    // return isUnderWarranty;
  }



  async delete(id: string) {
    const fnName = this.delete.name;
    const input = `Input : Device id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Device id : ${id} not found`);
      throw new Error(`${NO_RECORD} : Device id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : Device id : ${id} deleted successfully`);
      return result;
    }
  }
}
