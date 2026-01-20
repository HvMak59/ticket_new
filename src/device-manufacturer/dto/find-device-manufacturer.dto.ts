import { FindOptionsWhere } from 'typeorm';
import { DeviceManufacturer } from '../entity/device-manufacturer.entity';

export interface FindDeviceManufacturerDto extends FindOptionsWhere<DeviceManufacturer> {}
